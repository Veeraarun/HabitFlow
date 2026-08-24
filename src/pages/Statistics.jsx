import { useHabits } from "../hooks/useHabits";

import { getRangeSummary, getTotalCompletions } from "../utils/statistics";
import { formatDate, getTodayDate } from "../utils/dates";
import { getWeekStart } from "../utils/frequency";
import { getCompletionDates } from "../utils/completions";
import { calculateCurrentStreak, calculateLongestStreak } from "../utils/streaks";

function Statistics() {
  const { habits, completions, isLoading } = useHabits();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  const today = getTodayDate();
  const weekStart = getWeekStart(today);
  const monthStart = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const activeHabits = habits.filter((habit) => habit.active);

  const getRangeSummaryLocal = (relevantHabits, startDate, endDate) =>
    getRangeSummary(relevantHabits, completions, startDate, endDate);

  const weeklySummary = getRangeSummaryLocal(activeHabits, weekStart, today);
  const monthlySummary = getRangeSummaryLocal(activeHabits, monthStart, today);

  const getStreakSummary = (relevantHabits, calculation) => {
    const candidates = relevantHabits.map((habit) => ({
      habit,
      value: calculation(habit, getCompletionDates(habit.id, completions), today),
    }));
    const best = candidates.reduce(
      (currentBest, candidate) => candidate.value > currentBest.value ? candidate : currentBest,
      { habit: null, value: 0 },
    );

    return {
      ...best,
      unit: "days",
    };
  };

  const currentStreak = getStreakSummary(activeHabits, calculateCurrentStreak);
  const bestStreak = getStreakSummary(activeHabits, calculateLongestStreak);

  const habitPerformance = activeHabits.map((habit) => {
    const startDate = habit.createdAt?.slice(0, 10) || today;
    const summary = getRangeSummary([habit], startDate, today);

    return {
      ...habit,
      completedCount: summary.completed,
      expected: summary.expected,
      rate: summary.rate,
    };
  }).sort((first, second) => second.rate - first.rate || second.completedCount - first.completedCount);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Your progress</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Statistics</h1>
        <p className="mt-2 text-sm text-gray-500">A simple view of your consistency.</p>
      </div>

      {habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
          <p className="font-semibold text-gray-900">No data yet.</p>
          <p className="mt-2 text-sm text-gray-500">Add a habit and complete it to see your progress here.</p>
        </div>
      ) : (
        <>
          <section aria-label="Consistency summary" className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="This Week"
              value={weeklySummary.expected > 0 ? `${weeklySummary.rate}%` : "No data"}
              detail={weeklySummary.expected > 0 ? `${weeklySummary.completed} / ${weeklySummary.expected} completed` : "No active habits expected"}
            />
            <SummaryCard
              title="This Month"
              value={monthlySummary.expected > 0 ? `${monthlySummary.rate}%` : "No data"}
              detail={monthlySummary.expected > 0 ? `${monthlySummary.completed} / ${monthlySummary.expected} completed` : "Not enough activity yet"}
            />
            <SummaryCard
              title="Current Streak"
              value={currentStreak.value > 0 ? `${currentStreak.value} ${currentStreak.unit}` : "No streak yet"}
              detail={currentStreak.habit ? currentStreak.habit.name : "Complete a habit to begin"}
            />
            <SummaryCard
              title="Best Streak"
              value={bestStreak.value > 0 ? `${bestStreak.value} ${bestStreak.unit}` : "No streak yet"}
              detail={bestStreak.habit ? bestStreak.habit.name : `${getTotalCompletions(completions)} completions all time`}
            />
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6" aria-labelledby="habit-performance-heading">
            <div>
              <h2 id="habit-performance-heading" className="text-xl font-bold">Habit Performance</h2>
              <p className="mt-1 text-sm text-gray-500">Your completion rate for each habit&apos;s recorded history.</p>
            </div>

             <div className="mt-6 space-y-4">
              {habitPerformance.map((habit) => (
                <div key={habit.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl" aria-hidden="true">{habit.icon}</span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{habit.name}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          Daily habit
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold tabular-nums text-gray-900">{habit.expected > 0 ? `${habit.rate}%` : "No data"}</p>
                      <p className="mt-1 text-xs tabular-nums text-gray-500">{habit.completedCount} / {habit.expected}</p>
                    </div>
                  </div>

                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"
                    role="progressbar"
                    aria-label={`${habit.name} completion rate`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={habit.expected > 0 ? habit.rate : 0}
                  >
                    <div className="h-full rounded-full bg-gray-900" style={{ width: `${habit.expected > 0 ? habit.rate : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SummaryCard({ title, value, detail }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-gray-900">{value}</p>
      <p className="mt-2 text-sm text-gray-500 sm:truncate">{detail}</p>
    </div>
  );
}

export default Statistics;
