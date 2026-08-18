import { isHabitDueOnDate, isWeeklyHabitComplete } from "./frequency.js";
import { isHabitCompletedOnDate } from "./completions.js";

export function isValidReminderTime(time) {
  return (
    typeof time === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  );
}

export function getReminderKey(
  habitId,
  dateString,
  reminderTime,
) {
  return `${habitId}-${dateString}-${reminderTime}`;
}

export function getCurrentHHMM(now) {
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// A reminder is due from its scheduled minute up to GRACE_MINUTES later.
// This tolerates small browser scheduling delays (e.g. a check at 20:01
// still delivers a 20:00 reminder) while never firing before the time.
const GRACE_MINUTES = 2;

function toMinutes(hhmm) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isReminderDue(currentTime, reminderTime) {
  if (!isValidReminderTime(currentTime) || !isValidReminderTime(reminderTime)) {
    return false;
  }

  const current = toMinutes(currentTime);
  const scheduled = toMinutes(reminderTime);

  return current >= scheduled && current <= scheduled + GRACE_MINUTES;
}

export function getDueReminderHabits({
  habits,
  completions,
  reminderRecords,
  dateString,
  currentHHMM,
}) {
  return habits
    .filter((habit) => {
      const reminder = habit.reminder || {
        enabled: false,
        time: null,
      };

      if (!habit.active) return false;
      if (reminder.enabled !== true) return false;

      if (!isValidReminderTime(reminder.time)) {
        return false;
      }

      if (!isReminderDue(currentHHMM, reminder.time)) {
        return false;
      }

      if (
        isHabitDueOnDate(habit, dateString) === false
      ) {
        return false;
      }

      if (
        isHabitCompletedOnDate(
          habit.id,
          dateString,
          completions,
        )
      ) {
        return false;
      }

      if (
        habit.frequency?.type === "weekly" &&
        isWeeklyHabitComplete(
          habit,
          completions,
          dateString,
        )
      ) {
        return false;
      }

      const key = getReminderKey(
        habit.id,
        dateString,
        reminder.time,
      );

      if (
        reminderRecords.some(
          (record) => record.key === key,
        )
      ) {
        return false;
      }

      return true;
    })
    .map((habit) => ({
      habit,
      key: getReminderKey(
        habit.id,
        dateString,
        habit.reminder.time,
      ),
    }));
}