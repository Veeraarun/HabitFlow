import { getDateDaysAgo } from "../../utils/dates";

function ActivityPreview({ habits, completions }) {
  const habitIds = new Set(habits.map((habit) => habit.id));
  const dates = Array.from({ length: 28 }, (_, index) => getDateDaysAgo(27 - index));
  const dailyCounts = dates.map((date) =>
    completions.filter(
      (completion) =>
        completion.date === date &&
        completion.completed !== false &&
        habitIds.has(completion.habitId),
    ).length,
  );
  const highestCount = Math.max(1, ...dailyCounts);
  const weeks = Array.from({ length: 4 }, (_, weekIndex) =>
    dailyCounts.slice(weekIndex * 7, weekIndex * 7 + 7),
  );

  const getIntensity = (value) => {
    if (value === 0) return "bg-gray-100";
    const ratio = value / highestCount;
    if (ratio <= 0.25) return "bg-gray-200";
    if (ratio <= 0.5) return "bg-gray-400";
    if (ratio <= 0.75) return "bg-gray-600";
    return "bg-gray-900";
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Activity</h2>
          <p className="mt-1 text-sm text-gray-500">Your completion history over the last four weeks.</p>
        </div>
        <span className="shrink-0 text-sm font-medium text-gray-500">Last 4 weeks</span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-2">
              {week.map((value, dayIndex) => {
                const date = dates[weekIndex * 7 + dayIndex];
                return (
                  <div
                    key={date}
                    className={`h-4 w-4 rounded-sm ${getIntensity(value)}`}
                    title={`${date}: ${value} habits completed`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2 text-xs text-gray-500">
        <span>Less</span>
        <span className="h-3 w-3 rounded-sm bg-gray-100" />
        <span className="h-3 w-3 rounded-sm bg-gray-200" />
        <span className="h-3 w-3 rounded-sm bg-gray-400" />
        <span className="h-3 w-3 rounded-sm bg-gray-600" />
        <span className="h-3 w-3 rounded-sm bg-gray-900" />
        <span>More</span>
      </div>
    </div>
  );
}

export default ActivityPreview;
