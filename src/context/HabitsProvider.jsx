import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  getHabits,
  getCompletions,
  saveHabit,
  saveCompletion,
  deleteCompletion,
  deleteHabit,
  addSyncOperation,
} from "../db/database";
import { HabitsContext } from "./HabitsContext";
import { getTodayDate } from "../utils/dates";
import {
  processSyncQueue,
  isSyncActive,
  syncFromCloud,
  isCloudSyncActive,
} from "../services/syncEngine";
import { useAuth } from "../hooks/useAuth";

export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const inFlightKeys = useRef(new Set());
  const syncTriggeredRef = useRef(false);

  const { user, isLoading: isAuthLoading } = useAuth();

  const refreshData = useCallback(async (userId) => {
    try {
      const [storedHabits, storedCompletions] = await Promise.all([
        getHabits(userId),
        getCompletions(userId),
      ]);

      setHabits(storedHabits);
      setCompletions(storedCompletions);
    } catch (error) {
      console.error("Failed to load habit data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      setHabits([]);
      setCompletions([]);
      setIsLoading(false);
      syncTriggeredRef.current = false;
      return;
    }

    refreshData(user.id);
  }, [user, isAuthLoading, refreshData]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      syncTriggeredRef.current = false;
      return;
    }

    if (syncTriggeredRef.current) return;
    syncTriggeredRef.current = true;

    const timer = setTimeout(async () => {
      try {
        if (!isCloudSyncActive()) {
          await syncFromCloud();
          await refreshData(user.id);
        }

        if (!isSyncActive()) {
          await processSyncQueue();
        }
      } catch (error) {
        console.error("Initial sync failed:", error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, isAuthLoading, refreshData]);

  useEffect(() => {
    if (!user || isAuthLoading) return;

    const interval = setInterval(async () => {
      try {
        if (!isCloudSyncActive()) {
          await syncFromCloud();
          await refreshData(user.id);
        }

        if (!isSyncActive()) {
          await processSyncQueue();
        }
      } catch (error) {
        console.error("Periodic sync failed:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, isAuthLoading, refreshData]);

  const addHabit = useCallback(async (habitData) => {
    const now = new Date().toISOString();

    const habit = {
      id: Date.now(),
      cloudId: null,
      userId: user?.id || null,
      ...habitData,
      active: true,
      createdAt: getTodayDate(),
      updatedAt: now,
      deletedAt: null,
    };

    setHabits((items) => [...items, habit]);

    try {
      await saveHabit(habit);

      if (user) {
        await addSyncOperation({
          id: crypto.randomUUID(),
          type: "create_habit",
          entityType: "habit",
          entityId: String(habit.id),
          userId: user.id,
          payload: habit,
          createdAt: now,
          attempts: 0,
        });
      }
    } catch (error) {
      setHabits((items) => items.filter((item) => item.id !== habit.id));
      console.error("Failed to save new habit:", error);
    }
  }, [user]);

  const updateHabit = useCallback(async (habitData) => {
    const previousHabits = habits;
    const now = new Date().toISOString();

    // Fetch the latest version from the database to avoid overwriting cloudId
    const localHabits = await getHabits(user?.id);
    const existingHabit = localHabits.find((h) => String(h.id) === String(habitData.id));

    setHabits((items) =>
      items.map((habit) =>
        habit.id === habitData.id
          ? {
              ...habit,
              ...habitData,
              cloudId: existingHabit?.cloudId || habit.cloudId,
              updatedAt: now,
            }
          : habit,
      ),
    );

    try {
      const updated = {
        ...(existingHabit || previousHabits.find((habit) => habit.id === habitData.id)),
        ...habitData,
        updatedAt: now,
      };
      await saveHabit(updated);

      if (user) {
        await addSyncOperation({
          id: crypto.randomUUID(),
          type: "update_habit",
          entityType: "habit",
          entityId: String(updated.id),
          userId: user.id,
          payload: updated,
          createdAt: now,
          attempts: 0,
        });
      }
    } catch (error) {
      setHabits(previousHabits);
      console.error("Failed to save edited habit:", error);
    }
  }, [habits, user]);

  const toggleCompletion = useCallback(async (habitId, date) => {
    const completionId = `${habitId}-${date}`;

    if (inFlightKeys.current.has(completionId)) {
      return;
    }

    inFlightKeys.current.add(completionId);

    const now = new Date().toISOString();

    const completion = {
      id: completionId,
      habitId,
      date,
      completed: true,
      updatedAt: now,
      userId: user?.id || null,
    };

    const wasCompleted = completions.some(
      (item) => item.id === completionId,
    );

    setCompletions((items) =>
      wasCompleted
        ? items.filter((item) => item.id !== completionId)
        : [...items, completion],
    );

    try {
      if (wasCompleted) {
        // Persist the sync operation BEFORE deleting from IndexedDB.
        // This prevents syncFromCloud from restoring the completion
        // from Supabase during the gap between the two operations.
        if (user) {
          await addSyncOperation({
            id: crypto.randomUUID(),
            type: "delete_completion",
            entityType: "completion",
            entityId: completionId,
            userId: user.id,
            payload: { habitId, date },
            createdAt: now,
            attempts: 0,
          });
        }

        await deleteCompletion(habitId, date);
      } else {
        // Persist the sync operation BEFORE saving to IndexedDB.
        // This prevents the cloud-merge cleanup from removing the
        // completion (because it is not yet in Supabase) during the
        // gap between the two operations.
        if (user) {
          await addSyncOperation({
            id: crypto.randomUUID(),
            type: "create_completion",
            entityType: "completion",
            entityId: completionId,
            userId: user.id,
            payload: completion,
            createdAt: now,
            attempts: 0,
          });
        }

        await saveCompletion(completion);
      }
    } catch (error) {
      setCompletions((items) =>
        wasCompleted
          ? [...items, completion]
          : items.filter((item) => item.id !== completionId),
      );
      console.error("Failed to save completion:", error);
    } finally {
      inFlightKeys.current.delete(completionId);
    }
  }, [completions, user]);

  const deleteHabitPermanent = useCallback(async (habitId) => {
    const previousHabits = habits;
    const previousCompletions = completions;
    const now = new Date().toISOString();

    const habitToDelete = habits.find((habit) => habit.id === habitId);
    const completionsToDelete = completions.filter(
      (completion) => completion.habitId === habitId,
    );

    setHabits((items) => items.filter((item) => item.id !== habitId));
    setCompletions((items) =>
      items.filter((item) => item.habitId === habitId),
    );

    try {
      await deleteHabit(habitId);

      if (user) {
        await addSyncOperation({
          id: crypto.randomUUID(),
          type: "delete_habit",
          entityType: "habit",
          entityId: String(habitId),
          userId: user.id,
          payload: {
            habit: habitToDelete,
            completions: completionsToDelete,
            deletedAt: now,
          },
          createdAt: now,
          attempts: 0,
        });
      }
    } catch (error) {
      setHabits(previousHabits);
      setCompletions(previousCompletions);
      console.error("Failed to delete habit:", error);
    }
  }, [habits, completions, user]);

  const triggerSync = useCallback(async () => {
    if (!user || isSyncActive()) return;

    try {
      await processSyncQueue();
    } catch (error) {
      console.error("Manual sync failed:", error);
    }
  }, [user]);

  const value = {
    habits,
    completions,
    isLoading,
    addHabit,
    updateHabit,
    toggleCompletion,
    deleteHabit: deleteHabitPermanent,
    refreshData,
    triggerSync,
  };

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}
