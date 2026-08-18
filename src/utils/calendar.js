import { isHabitDueOnDate } from "./frequency";
import { isHabitCompletedOnDate } from "./completions";

export function getExpectedHabitsForDate(
  habits,
  date,
) {
  return habits.filter((habit) => {
    const createdDate =
      habit.createdAt?.slice(0, 10);

    if (createdDate && createdDate > date) {
      return false;
    }

    // Weekly targets are measured across the week, not as a required task on
    // each calendar day. Calendar adds their recorded completions separately.
    if (habit.frequency?.type === "weekly") {
      return false;
    }

    return isHabitDueOnDate(
      habit,
      date,
    );
  });
}

export function getDaysInMonth(year, month) {
  return new Date(
    year,
    month + 1,
    0
  ).getDate();
}

export function getFirstDayOfMonth(
  year,
  month
) {
  const day = new Date(
    year,
    month,
    1
  ).getDay();

  // Convert Sunday = 0 to Monday-based index
  return day === 0 ? 6 : day - 1;
}

export function formatCalendarDate(
  year,
  month,
  day
) {
  const monthString = String(
    month + 1
  ).padStart(2, "0");

  const dayString = String(
    day
  ).padStart(2, "0");

  return `${year}-${monthString}-${dayString}`;
}

export function getHistoricalHabitsForDate(habits, date, completions) {
  const scheduledHabits = getExpectedHabitsForDate(habits, date);
  const completedWeeklyHabits = habits.filter(
    (habit) =>
      habit.frequency?.type === "weekly" &&
      isHabitCompletedOnDate(habit.id, date, completions),
  );

  return [...scheduledHabits, ...completedWeeklyHabits];
}
