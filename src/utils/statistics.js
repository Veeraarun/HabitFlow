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
