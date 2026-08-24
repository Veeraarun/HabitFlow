import { getExpectedCompletions } from "./frequency";

export function calculateCompletionRate(completed, total) {
  if (total === 0) {
    return 0;
  }

  return Math.min(100, Math.round((completed / total) * 100));
}

export function getCompletedDates(completions, habitId) {
  return completions
    .filter(
      (completion) =>
        completion.habitId === habitId &&
        completion.completed !== false
    )
    .map((completion) => completion.date);
}

export function getTotalCompletions(completions) {
  return completions.filter(
    (completion) => completion.completed !== false
  ).length;
}

export function getCompletionsForDate(
  completions,
  date
) {
  return completions.filter(
    (completion) =>
      completion.date === date &&
      completion.completed !== false
  );
}

export function getRangeSummary(habits, completions, startDate, endDate) {
  const expected = habits.reduce(
    (total, habit) => total + getExpectedCompletions(habit, startDate, endDate),
    0
  );

  const habitById = new Map(habits.map((habit) => [habit.id, habit]));
  const completed = completions.filter((completion) => {
    const habit = habitById.get(completion.habitId);

    return (
      completion.completed === true &&
      habit &&
      completion.date >= startDate &&
      completion.date <= endDate
    );
  }).length;

  return {
    completed,
    expected,
    rate: calculateCompletionRate(completed, expected),
  };
}
