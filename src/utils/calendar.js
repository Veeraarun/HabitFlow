import { isHabitDueOnDate } from "./frequency";

export function getExpectedHabitsForDate(
  habits,
  date,
) {
  return habits.filter((habit) => {
    if (!habit.active) {
      return false;
    }

    const createdDate =
      habit.createdAt?.slice(0, 10);

    if (createdDate && createdDate > date) {
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
