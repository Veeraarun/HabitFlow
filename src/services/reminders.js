import {
  getCompletions,
  getHabits,
  getReminderRecords,
  saveReminderRecord,
} from "../db/database";
import {
  getCurrentHHMM,
  getDueReminderHabits,
} from "../utils/reminders";
import { getTodayDate } from "../utils/dates";
import {
  getNotificationPermission,
  showNotification,
} from "../utils/notifications";

let intervalId = null;

export async function checkReminders() {
  const today = getTodayDate();
  const now = new Date();
  const currentHHMM = getCurrentHHMM(now);

  const [habits, completions, reminderRecords] =
    await Promise.all([
      getHabits(),
      getCompletions(),
      getReminderRecords(),
    ]);

  const due = getDueReminderHabits({
    habits,
    completions,
    reminderRecords,
    dateString: today,
    currentHHMM,
  });

  for (const { habit, key } of due) {
    const permission = getNotificationPermission();

    if (permission !== "granted") {
      continue;
    }

    const reminderTime = habit.reminder?.time;

    if (!reminderTime) {
      continue;
    }

    try {
      await showHabitReminderNotification(habit);

      await saveReminderRecord({
        key,
        habitId: habit.id,
        date: today,
        time: reminderTime,
        deliveredAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        `Failed to deliver reminder for habit "${habit.name}":`,
        error,
      );
    }
  }
}

function showHabitReminderNotification(habit) {
  const reminderTime = habit.reminder?.time || "00:00";

  return showNotification("HabitFlow", {
    body: `Time for ${habit.name} ${habit.icon || ""}`.trim(),
    tag: `habitflow-reminder-${habit.id}-${getTodayDate()}-${reminderTime}`,
    data: {
      url: "/",
      habitId: habit.id,
    },
  });
}

export function startReminderScheduler() {
  if (intervalId !== null) {
    return;
  }

  checkReminders();

  intervalId = setInterval(() => {
    checkReminders();
  }, 60000);
}

export function stopReminderScheduler() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}