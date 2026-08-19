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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none" aria-hidden="true">
            📅
          </span>
          <h2 className="text-sm font-semibold text-gray-900">Activity</h2>
        </div>
        <span className="shrink-0 text-xs font-medium text-gray-500">
          Last 4 weeks
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1.5">
            {week.map((value, dayIndex) => {
              const date = dates[weekIndex * 7 + dayIndex];
              return (
                <div
                  key={date}
                  className={`h-3 w-3 rounded-[3px] sm:h-4 sm:w-4 ${getIntensity(value)}`}
                  title={`${date}: ${value} habits completed`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-1.5 text-xs text-gray-500">
        <span>Less</span>
        <span className="h-2.5 w-2.5 rounded-[2px] bg-gray-100" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-gray-200" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-gray-400" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-gray-600" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-gray-900" />
        <span>More</span>
      </div>
    </div>
  );
}

export default ActivityPreview;
