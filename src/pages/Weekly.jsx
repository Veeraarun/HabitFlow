import { useState } from "react";
import { useHabits } from "../hooks/useHabits";

import {
  addDaysToDate,
  getTodayDate,
  getWeekDates,
  getWeekLabel,
  getWeekStartDate,
} from "../utils/dates";

import { isHabitDueOnDate } from "../utils/frequency";
import { calculateCurrentStreak } from "../utils/streaks";
import { getCompletionDates, isHabitCompletedOnDate } from "../utils/completions";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Weekly() {
  const {
    habits,
    completions,
    isLoading,
    toggleCompletion,
  } = useHabits();

  const today = getTodayDate();
  const [weekStart, setWeekStart] = useState(getWeekStartDate(today));

  const weekDates = getWeekDates(weekStart);
  const isCurrentWeek = weekStart === getWeekStartDate(today);
  const isFutureWeek = weekStart > getWeekStartDate(today);

  const activeHabits = habits.filter((habit) => habit.active);

  const getHabitCellState = (habit, date) => {
    const createdDate = habit.createdAt?.slice(0, 10);

    if (createdDate && createdDate > date) {
      return "unavailable";
    }

    if (date > today) {
      return "future";
    }

    if (!isHabitDueOnDate(habit, date)) {
      return "unavailable";
    }

    return isHabitCompletedOnDate(habit.id, date, completions)
      ? "completed"
      : "incomplete";
  };

  let totalValidDays = 0;
  let totalCompletedDays = 0;

  const habitRows = activeHabits.map((habit) => {
    const completionDates = getCompletionDates(habit.id, completions);
    const currentStreak = calculateCurrentStreak(habit, completionDates, today);

    let habitValidDays = 0;
    let habitCompletedDays = 0;

    const cells = weekDates.map((date) => {
      const state = getHabitCellState(habit, date);

      if (state === "completed") {
        habitValidDays += 1;
        habitCompletedDays += 1;
      } else if (state === "incomplete") {
        habitValidDays += 1;
      }

      return { date, state };
    });

    totalValidDays += habitValidDays;
    totalCompletedDays += habitCompletedDays;

    return {
      habit,
      currentStreak,
      cells,
      habitValidDays,
      habitCompletedDays,
    };
  });

  const goToPreviousWeek = () => {
    setWeekStart((current) => addDaysToDate(current, -7));
  };

  const goToNextWeek = () => {
    setWeekStart((current) => addDaysToDate(current, 7));
  };

  const goToCurrentWeek = () => {
    setWeekStart(getWeekStartDate(today));
  };

  const getCellClass = (state) => {
    if (state === "completed") {
      return "bg-gray-900 text-white";
    }
    if (state === "incomplete") {
      return "border-2 border-gray-300 bg-white text-transparent hover:border-gray-400";
    }
    if (state === "future") {
      return "border border-dashed border-gray-200 bg-gray-50 text-transparent";
    }
    return "bg-gray-50 text-transparent";
  };

  const getCellLabel = (habit, date, state) => {
    if (state === "completed") {
      return `Mark ${habit.name} as incomplete on ${date}`;
    }
    if (state === "incomplete") {
      return `Mark ${habit.name} as complete on ${date}`;
    }
    if (state === "future") {
      return `${habit.name} — future date`;
    }
    return `${habit.name} — not available`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading your habits...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Weekly
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
          Week View
        </h1>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goToPreviousWeek}
            aria-label="Previous week"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            ‹
          </button>

          <div className="flex-1 text-center">
            <p className="text-sm font-medium text-gray-900">{getWeekLabel(weekStart)}</p>
            {!isCurrentWeek && (
              <button
                type="button"
                onClick={goToCurrentWeek}
                className="mt-1 text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                Back to current week
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={goToNextWeek}
            aria-label="Next week"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            ›
          </button>
        </div>

        {isFutureWeek ? (
          <p className="rounded-xl bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
            Future week &mdash; completions cannot be changed.
          </p>
        ) : totalValidDays === 0 ? (
          <p className="rounded-xl bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
            No habit-days to track this week.
          </p>
        ) : (
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-gray-500">Week Progress</p>
            <p className="text-sm tabular-nums text-gray-500">
              {totalCompletedDays} / {totalValidDays}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-xs font-semibold text-gray-400 sm:px-5">
                  Habit
                </th>
                {DAY_LABELS.map((label, index) => {
                  const date = weekDates[index];
                  const isDayFuture = date > today;
                  return (
                    <th
                      key={label}
                      className="px-2 py-3 text-center text-xs font-semibold text-gray-400"
                    >
                      <span className="block">{label}</span>
                      <span className={`block text-[10px] font-normal ${isDayFuture ? "text-gray-300" : "text-gray-400"}`}>
                        {new Date(`${date}T00:00:00`).getDate()}
                      </span>
                    </th>
                  );
                })}
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 sm:px-5">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody>
              {activeHabits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400 sm:px-5">
                    No habits yet. Add a habit to start tracking.
                  </td>
                </tr>
              ) : (
                habitRows.map(({ habit, currentStreak, cells, habitValidDays, habitCompletedDays }) => (
                  <tr key={habit.id} className="border-b border-gray-50 last:border-b-0">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 sm:px-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
                          {habit.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{habit.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            {currentStreak > 0 && (
                              <span className="flex items-center gap-0.5">
                                🔥 {currentStreak}
                              </span>
                            )}
                            {habit.reminder?.enabled && (
                              <span>⏰ {habit.reminder.time}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    {cells.map(({ date, state }) => {
                      const isInteractive = state === "completed" || state === "incomplete";
                      return (
                        <td key={date} className="px-2 py-3 text-center">
                          <button
                            type="button"
                            onClick={isInteractive ? () => toggleCompletion(habit.id, date) : undefined}
                            disabled={!isInteractive}
                            aria-label={getCellLabel(habit, date, state)}
                            className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${getCellClass(state)} ${isInteractive ? "cursor-pointer" : "cursor-default"}`}
                          >
                            {state === "completed" && "✓"}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center text-xs tabular-nums text-gray-500 sm:px-5">
                      {habitValidDays > 0 ? `${habitCompletedDays} / ${habitValidDays}` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Weekly;
