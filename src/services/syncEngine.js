import { supabase } from "./supabase";
import {
  getSyncOperations,
  removeSyncOperation,
  updateSyncOperation,
  getHabits,
  getCompletions,
  saveHabit,
  getPendingOperationsForEntity,
  saveHabitFromCloud,
  saveCompletionFromCloud,
  deleteHabitFromCloud,
  deleteCompletion,
} from "../db/database";

let isSyncing = false;
let currentUserId = null;
let shouldStop = false;
let syncFromCloudInProgress = false;

export function isSyncActive() {
  return isSyncing;
}

export function requestSyncStop() {
  shouldStop = true;
}

async function getCurrentUser() {
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

async function buildLocalToCloudIdMap(userId) {
  const habits = await getHabits(userId);
  const map = new Map();

  for (const habit of habits) {
    if (habit.cloudId) {
      map.set(habit.id, habit.cloudId);
    }
  }

  return map;
}

async function getLocalHabit(localId, userId) {
  const habits = await getHabits(userId);
  return habits.find((h) => String(h.id) === String(localId)) || null;
}

async function getLocalCompletion(habitId, date, userId) {
  const completions = await getCompletions(userId);
  const id = `${habitId}-${date}`;
  return completions.find((c) => String(c.id) === String(id)) || null;
}

async function processCreateHabit(operation, userId, localToCloudMap) {
  const habit = operation.payload;

  const localHabit = await getLocalHabit(habit.id, userId);
  if (!localHabit) {
    await removeSyncOperation(operation.id);
    return { success: true, skipped: true };
  }

  const { data, error } = await supabase
    .from("habits")
    .upsert(
      {
        user_id: userId,
        local_id: habit.id,
        name: habit.name,
        icon: habit.icon,
        frequency: habit.frequency,
        reminder: habit.reminder,
        active: habit.active,
        created_at: habit.createdAt,
        updated_at: habit.updatedAt,
        deleted_at: habit.deletedAt,
      },
      { onConflict: "user_id,local_id" }
    )
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, retryable: true, error: "Duplicate conflict" };
    }
    return { success: false, retryable: true, error: error.message };
  }

  const cloudId = data.id;
  localToCloudMap.set(habit.id, cloudId);

  await saveHabit({ ...localHabit, cloudId });

  await removeSyncOperation(operation.id);

  return { success: true, cloudId };
}

async function processUpdateHabit(operation, userId, localToCloudMap) {
  const habit = operation.payload;

  const localHabit = await getLocalHabit(habit.id, userId);
  if (!localHabit) {
    await removeSyncOperation(operation.id);
    return { success: true, skipped: true };
  }

  if (localHabit.deletedAt) {
    await removeSyncOperation(operation.id);
    return { success: true, skipped: true };
  }

  let cloudId = localHabit.cloudId || localToCloudMap.get(habit.id);

  if (!cloudId) {
    return { success: false, retryable: true, deferred: true };
  }

  const { error } = await supabase
    .from("habits")
    .update({
      name: habit.name,
      icon: habit.icon,
      frequency: habit.frequency,
      reminder: habit.reminder,
      active: habit.active,
      updated_at: habit.updatedAt,
    })
    .eq("id", cloudId)
    .eq("user_id", userId);

  if (error) {
    return { success: false, retryable: true, error: error.message };
  }

  await removeSyncOperation(operation.id);

  return { success: true };
}

async function processDeleteHabit(operation, userId, localToCloudMap) {
  const { habit } = operation.payload;

  let cloudId = habit?.cloudId || localToCloudMap.get(habit?.id);

  if (cloudId) {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("habits")
      .update({ deleted_at: now })
      .eq("id", cloudId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, retryable: true, error: error.message };
    }

    localToCloudMap.delete(habit.id);
  }

  await removeSyncOperation(operation.id);

  return { success: true };
}

async function processCreateCompletion(operation, userId, localToCloudMap) {
  const completion = operation.payload;

  const localHabit = await getLocalHabit(completion.habitId, userId);
  if (!localHabit || localHabit.deletedAt) {
    await removeSyncOperation(operation.id);
    return { success: true, skipped: true };
  }

  let cloudId = localHabit.cloudId || localToCloudMap.get(completion.habitId);

  if (!cloudId) {
    return { success: false, retryable: true, deferred: true };
  }

  // Use the operation payload as authoritative source for cloud write
  const dateStr = completion.date;
  const updatedAtStr = completion.updatedAt || operation.createdAt || new Date().toISOString();

  const { error } = await supabase
    .from("completions")
    .upsert(
      {
        user_id: userId,
        habit_id: cloudId,
        date: dateStr,
        created_at: updatedAtStr,
        updated_at: updatedAtStr,
      },
      { onConflict: "user_id,habit_id,date" }
    );

  if (error) {
    return { success: false, retryable: true, error: error.message };
  }

  // Ensure local completion is present in IndexedDB after cloud upsert succeeds
  const localCompletion = await getLocalCompletion(
    completion.habitId,
    completion.date,
    userId
  );
  if (!localCompletion) {
    await saveCompletionFromCloud({
      id: `${completion.habitId}-${completion.date}`,
      habitId: completion.habitId,
      date: completion.date,
      completed: true,
      updatedAt: updatedAtStr,
      userId: userId,
    });
  }

  await removeSyncOperation(operation.id);

  return { success: true };
}

async function processDeleteCompletion(operation, userId, localToCloudMap) {
  const { habitId, date } = operation.payload;

  const localHabit = await getLocalHabit(habitId, userId);

  if (!localHabit || localHabit.deletedAt) {
    await removeSyncOperation(operation.id);
    return { success: true, skipped: true };
  }

  let cloudId = localHabit.cloudId || localToCloudMap.get(habitId);

  if (!cloudId) {
    return { success: false, retryable: true, deferred: true };
  }

  // A pending delete_completion represents an explicit user action.
  // Delete from Supabase regardless of whether a local completion
  // currently exists.
  const { error } = await supabase
    .from("completions")
    .delete()
    .eq("habit_id", cloudId)
    .eq("user_id", userId)
    .eq("date", date);

  if (error) {
    return { success: false, retryable: true, error: error.message };
  }

  await removeSyncOperation(operation.id);

  return { success: true };
}

export function isCloudSyncActive() {
  return syncFromCloudInProgress;
}

function cloudHabitToLocalHabit(cloudHabit, userId) {
  return {
    id: Number(cloudHabit.local_id),
    cloudId: cloudHabit.id,
    userId: userId,
    name: cloudHabit.name,
    icon: cloudHabit.icon,
    frequency: cloudHabit.frequency,
    reminder: cloudHabit.reminder,
    active: cloudHabit.active,
    createdAt: cloudHabit.created_at,
    updatedAt: cloudHabit.updated_at,
    deletedAt: cloudHabit.deleted_at,
  };
}

function cloudCompletionToLocalCompletion(cloudCompletion, localHabitId, userId) {
  return {
    id: `${localHabitId}-${cloudCompletion.date}`,
    habitId: localHabitId,
    date: cloudCompletion.date,
    completed: true,
    updatedAt: cloudCompletion.updated_at,
    userId: userId,
  };
}

function isTimestampNewer(newTimestamp, oldTimestamp) {
  if (!oldTimestamp) return true;
  if (!newTimestamp) return false;

  const newDate = new Date(newTimestamp);
  const oldDate = new Date(oldTimestamp);

  return newDate > oldDate;
}

async function mergeHabitsFromCloud(userId, localToCloudMap) {
  const { data: cloudHabits, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to fetch cloud habits: ${error.message}`);
  }

  const localHabits = await getHabits(userId);
  const habitsToInsert = [];
  const habitsToUpdate = [];
  const habitsToMarkDeleted = [];

  for (const cloudHabit of cloudHabits) {
    let localHabit = null;

    if (cloudHabit.local_id) {
      localHabit = localHabits.find((h) => String(h.id) === String(cloudHabit.local_id));
    }

    if (!localHabit && cloudHabit.id) {
      localHabit = localHabits.find((h) => h.cloudId === cloudHabit.id);
    }

    if (cloudHabit.deleted_at) {
      if (localHabit && !localHabit.deletedAt) {
        const pendingOps = await getPendingOperationsForEntity(
          "habit",
          localHabit.id
        );

        const hasPendingUpdate = pendingOps.some(
          (op) => op.type === "update_habit" || op.type === "create_habit"
        );

        if (!hasPendingUpdate) {
          habitsToMarkDeleted.push(localHabit.id);
        }
      }
      continue;
    }

    if (!localHabit) {
      const localHabitConverted = cloudHabitToLocalHabit(cloudHabit, userId);
      habitsToInsert.push(localHabitConverted);
      localToCloudMap.set(cloudHabit.local_id, cloudHabit.id);
    } else {
      localToCloudMap.set(localHabit.id, cloudHabit.id);

      const pendingOps = await getPendingOperationsForEntity(
        "habit",
        localHabit.id
      );

      const hasPendingLocalChange = pendingOps.some(
        (op) => op.type === "update_habit" || op.type === "create_habit"
      );

      if (hasPendingLocalChange) {
        continue;
      }

      if (isTimestampNewer(cloudHabit.updated_at, localHabit.updatedAt)) {
        const updatedHabit = cloudHabitToLocalHabit(cloudHabit, userId);
        habitsToUpdate.push(updatedHabit);
      }
    }
  }

  for (const habit of habitsToInsert) {
    await saveHabitFromCloud(habit);
  }

  for (const habit of habitsToUpdate) {
    await saveHabitFromCloud(habit);
  }

  for (const localId of habitsToMarkDeleted) {
    await deleteHabitFromCloud(localId);
  }

  return {
    inserted: habitsToInsert.length,
    updated: habitsToUpdate.length,
    deleted: habitsToMarkDeleted.length,
  };
}

async function mergeCompletionsFromCloud(userId, localToCloudMap) {
  const { data: cloudCompletions, error } = await supabase
    .from("completions")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to fetch cloud completions: ${error.message}`);
  }

  const localCompletions = await getCompletions(userId);
  const localHabits = await getHabits(userId);

  const cloudToLocalHabitMap = new Map();
  for (const [localId, cloudId] of localToCloudMap.entries()) {
    cloudToLocalHabitMap.set(cloudId, localId);
  }
  for (const habit of localHabits) {
    if (habit.cloudId && !cloudToLocalHabitMap.has(habit.cloudId)) {
      cloudToLocalHabitMap.set(habit.cloudId, habit.id);
    }
  }

  const completionsToInsert = [];

  for (const cloudCompletion of cloudCompletions) {
    const localHabitId = cloudToLocalHabitMap.get(cloudCompletion.habit_id);

    if (!localHabitId) {
      continue;
    }

    const localHabit = localHabits.find((h) => h.id === localHabitId);
    if (!localHabit || localHabit.deletedAt) {
      continue;
    }

    const localCompletionId = `${localHabitId}-${cloudCompletion.date}`;

    // Unified pending ops check: find the NEWEST pending operation for
    // this completion key. The user's latest action determines behavior.
    const pendingOpsForCompletion = await getPendingOperationsForEntity(
      "completion",
      localCompletionId
    );

    let newestPendingOp = null;
    for (const op of pendingOpsForCompletion) {
      const timeOp = new Date(op.createdAt).getTime();
      const timeNewest = newestPendingOp ? new Date(newestPendingOp.createdAt).getTime() : 0;
      if (!newestPendingOp || timeOp > timeNewest || (timeOp === timeNewest && op.id > newestPendingOp.id)) {
        newestPendingOp = op;
      }
    }

    if (newestPendingOp) {
      if (newestPendingOp.type === "delete_completion") {
        // User's latest action is delete → do not restore the cloud record
        continue;
      }
      if (newestPendingOp.type === "create_completion") {
        // User's latest action is create → skip the cloud record;
        // the pending create will be sent when processSyncQueue runs
        continue;
      }
    }

    const existingCompletion = localCompletions.find(
      (c) => c.id === localCompletionId
    );

    if (existingCompletion) {
      if (
        isTimestampNewer(cloudCompletion.updated_at, existingCompletion.updatedAt)
      ) {
        const updatedCompletion = cloudCompletionToLocalCompletion(
          cloudCompletion,
          localHabitId,
          userId
        );
        completionsToInsert.push(updatedCompletion);
      }
    } else {
      const newCompletion = cloudCompletionToLocalCompletion(
        cloudCompletion,
        localHabitId,
        userId
      );
      completionsToInsert.push(newCompletion);
    }
  }

  for (const completion of completionsToInsert) {
    await saveCompletionFromCloud(completion);
  }

  // Clean up stale local completions that no longer exist in Supabase.
  // Build a set of cloud completion IDs (mapped to local IDs).
  const cloudCompletionIds = new Set();
  for (const cloudCompletion of cloudCompletions) {
    const localHabitId = cloudToLocalHabitMap.get(cloudCompletion.habit_id);
    if (localHabitId) {
      cloudCompletionIds.add(`${localHabitId}-${cloudCompletion.date}`);
    }
  }

  // Remove local completions that are absent from the cloud,
  // unless a pending sync operation indicates the cloud has
  // not yet caught up with an offline action.
  const localCompletionsToRemove = localCompletions.filter(
    (c) => !cloudCompletionIds.has(c.id)
  );
  for (const localCompletion of localCompletionsToRemove) {
    // Unified pending ops check: find the NEWEST pending operation for
    // this completion key. Only protect the local completion when the
    // user's latest action is "create" (cloud hasn't caught up yet).
    const pendingOps = await getPendingOperationsForEntity(
      "completion",
      localCompletion.id
    );

    let newestPendingOp = null;
    for (const op of pendingOps) {
      const timeOp = new Date(op.createdAt).getTime();
      const timeNewest = newestPendingOp ? new Date(newestPendingOp.createdAt).getTime() : 0;
      if (!newestPendingOp || timeOp > timeNewest || (timeOp === timeNewest && op.id > newestPendingOp.id)) {
        newestPendingOp = op;
      }
    }

    if (newestPendingOp && newestPendingOp.type === "create_completion") {
      // User's latest action is create → preserve local completion.
      // The pending create will be sent to cloud when processSyncQueue runs.
      continue;
    }

    // Remove local completion if:
    // - No pending ops (cloud no longer has it)
    // - Newest pending op is delete_completion (user's latest action was delete)
    await deleteCompletion(localCompletion.habitId, localCompletion.date);
  }

  return {
    inserted: completionsToInsert.length,
    removed: localCompletionsToRemove.length,
  };
}

export async function syncFromCloud() {
  if (syncFromCloudInProgress) {
    return { status: "already-running" };
  }

  if (!supabase) {
    return { status: "supabase-not-configured" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { status: "not-authenticated" };
  }

  syncFromCloudInProgress = true;

  try {
    const localToCloudMap = await buildLocalToCloudIdMap(user.id);

    const habitResults = await mergeHabitsFromCloud(user.id, localToCloudMap);

    const completionResults = await mergeCompletionsFromCloud(
      user.id,
      localToCloudMap
    );

    return {
      status: "completed",
      habits: habitResults,
      completions: completionResults,
    };
  } catch (error) {
    return { status: "error", error: error.message };
  } finally {
    syncFromCloudInProgress = false;
  }
}

export async function processSyncQueue() {
  if (isSyncing) {
    return { status: "already-running" };
  }

  if (!supabase) {
    return { status: "supabase-not-configured" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { status: "not-authenticated" };
  }

  isSyncing = true;
  currentUserId = user.id;
  shouldStop = false;

  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    deferred: 0,
  };

  try {
    const localToCloudMap = await buildLocalToCloudIdMap(currentUserId);

    const allOperations = await getSyncOperations();
    const operations = allOperations.filter(
      (op) => op.userId === currentUserId
    );
    // Sort all loaded operations by actual date object
    operations.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      return a.id.localeCompare(b.id); // Deterministic fallback
    });

    const operationsByType = new Map();

    // Coalesce completion operations: for each unique completion key
    // (entityId = habitId + "-" + date), keep only the NEWEST operation.
    // Older ones are superseded by the user's latest action.
    const newestCompletionByKey = new Map();
    const supersededCompletionOps = [];

    for (const op of operations) {
      if (
        op.type === "create_completion" ||
        op.type === "delete_completion"
      ) {
        const key = String(op.entityId);
        const existing = newestCompletionByKey.get(key);
        const timeOp = new Date(op.createdAt).getTime();
        const timeExisting = existing ? new Date(existing.createdAt).getTime() : 0;

        if (!existing || timeOp > timeExisting || (timeOp === timeExisting && op.id > existing.id)) {
          if (existing) {
            supersededCompletionOps.push(existing);
          }
          newestCompletionByKey.set(key, op);
        } else {
          supersededCompletionOps.push(op);
        }
      }
    }

    // Remove superseded completion operations from IndexedDB
    for (const op of supersededCompletionOps) {
      try {
        await removeSyncOperation(op.id);
      } catch {
        // Ignore individual removal failures
      }
    }

    // Build operationsByType with superseded ops filtered out
    for (const op of operations) {
      if (
        op.type === "create_completion" ||
        op.type === "delete_completion"
      ) {
        const key = String(op.entityId);
        const newest = newestCompletionByKey.get(key);
        if (newest && String(newest.id) !== String(op.id)) {
          continue; // superseded, skip
        }
      }

      if (!operationsByType.has(op.type)) {
        operationsByType.set(op.type, []);
      }
      operationsByType.get(op.type).push(op);
    }

    const orderedTypes = [
      "create_habit",
      "update_habit",
      "create_completion",
      "delete_completion",
      "delete_habit",
    ];

    for (const type of orderedTypes) {
      const ops = operationsByType.get(type) || [];

      for (const operation of ops) {
        if (shouldStop) {
          results.processed++;
          continue;
        }

        const freshUser = await getCurrentUser();
        if (!freshUser || freshUser.id !== currentUserId) {
          shouldStop = true;
          results.processed++;
          continue;
        }

        results.processed++;

        let result;

        try {
          switch (operation.type) {
            case "create_habit":
              result = await processCreateHabit(
                operation,
                currentUserId,
                localToCloudMap
              );
              break;

            case "update_habit":
              result = await processUpdateHabit(
                operation,
                currentUserId,
                localToCloudMap
              );
              break;

            case "delete_habit":
              result = await processDeleteHabit(
                operation,
                currentUserId,
                localToCloudMap
              );
              break;

            case "create_completion":
              result = await processCreateCompletion(
                operation,
                currentUserId,
                localToCloudMap
              );
              break;

            case "delete_completion":
              result = await processDeleteCompletion(
                operation,
                currentUserId,
                localToCloudMap
              );
              break;

            default:
              result = { success: true, skipped: true };
          }
        } catch (error) {
          result = { success: false, retryable: true, error: error.message };
        }

        if (result.success) {
          if (result.skipped) {
            results.skipped++;
          } else {
            results.succeeded++;
          }
        } else if (result.deferred) {
          results.deferred++;
        } else {
          results.failed++;
          await updateSyncOperation(operation.id, {
            attempts: (operation.attempts || 0) + 1,
          });
        }
      }
    }

    return { status: "completed", results };
  } catch (error) {
    return { status: "error", error: error.message };
  } finally {
    isSyncing = false;
    currentUserId = null;
    shouldStop = false;
  }
}
