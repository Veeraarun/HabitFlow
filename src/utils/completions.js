export function isHabitCompletedOnDate(
  habitId,
  date,
  completions,
) {
  return completions.some(
    (completion) =>
      completion.habitId === habitId &&
      completion.date === date &&
      completion.completed === true,
  );
}

export function getCompletedHabitCount(
  habits,
  completions,
  date,
) {
  return habits.filter((habit) =>
    isHabitCompletedOnDate(
      habit.id,
      date,
      completions,
    ),
  ).length;
}

export function getCompletionDates(
  habitId,
  completions,
) {
  return completions
    .filter(
      (completion) =>
        completion.habitId === habitId &&
        completion.completed === true,
    )
    .map(
      (completion) =>
        completion.date,
    );
}
