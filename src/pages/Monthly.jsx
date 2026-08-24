import { useState } from "react";
import { useHabits } from "../hooks/useHabits";

import {
  getCurrentMonth,
  getMonthLabel,
  getNextMonth,
  getPreviousMonth,
  getTodayDate,
} from "../utils/dates";
import { formatCalendarDate, getDaysInMonth, getFirstDayOfMonth } from "../utils/calendar";
import { isHabitDueOnDate } from "../utils/frequency";
import { calculateCurrentStreak } from "../utils/streaks";
import {
  getCompletionDates,
  getCompletedHabitCount,
  isHabitCompletedOnDate,
} from "../utils/completions";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Monthly() {
  const {
    habits,
    completions,
    isLoading,
    toggleCompletion,
  } = useHabits();

  const today = getTodayDate();

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(today);

  const activeHabits = habits.filter((habit) => habit.active);

  const getValidHabitsForDate = (date) => {
    if (date > today) return [];

    return activeHabits.filter((habit) => {
      const createdDate = habit.createdAt?.slice(0, 10);
      if (createdDate && createdDate > date) return false;
      return isHabitDueOnDate(habit, date);
    });
  };

  const getDayProgress = (date) => {
    const relevantHabits = getValidHabitsForDate(date);

    if (relevantHabits.length === 0) {
      return { completed: 0, total: 0, rate: null };
    }

    const completed = getCompletedHabitCount(relevantHabits, completions, date);
    const rate = Math.round((completed / relevantHabits.length) * 100);

    return { completed, total: relevantHabits.length, rate };
  };

  let monthlyExpectedCompletions = 0;
  let monthlyCompletedCompletions = 0;

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = formatCalendarDate(currentYear, currentMonth, day);
    const { completed, total } = getDayProgress(date);

    if (total > 0) {
      monthlyExpectedCompletions += total;
      monthlyCompletedCompletions += completed;
    }
  }

  const monthlyPercentage = monthlyExpectedCompletions === 0
    ? 0
    : Math.round((monthlyCompletedCompletions / monthlyExpectedCompletions) * 100);

  const selectedDateHabits = getValidHabitsForDate(selectedDate);
  const isSelectedFuture = selectedDate > today;
  const isCurrentMonth = currentYear === getCurrentMonth().year && currentMonth === getCurrentMonth().month;

  const clampSelectedDate = (year, month) => {
    const lastDay = getDaysInMonth(year, month);
    const selectedDay = Number(selectedDate.slice(8, 10));

    if (
      selectedDate.startsWith(`${year}-${String(month + 1).padStart(2, "0")}-`) &&
      selectedDay <= lastDay
    ) {
      return;
    }

    const candidate = formatCalendarDate(year, month, Math.min(selectedDay, lastDay));
    if (candidate <= today) {
      setSelectedDate(candidate);
      return;
    }

    setSelectedDate(formatCalendarDate(year, month, Math.min(today.slice(8, 10), lastDay)));
  };

  const goToPreviousMonth = () => {
    const prev = getPreviousMonth(currentYear, currentMonth);
    setCurrentYear(prev.year);
    setCurrentMonth(prev.month);
    clampSelectedDate(prev.year, prev.month);
  };

  const goToNextMonth = () => {
    const next = getNextMonth(currentYear, currentMonth);
    setCurrentYear(next.year);
    setCurrentMonth(next.month);
    clampSelectedDate(next.year, next.month);
  };

  const goToCurrentMonth = () => {
    const current = getCurrentMonth();
    setCurrentYear(current.year);
    setCurrentMonth(current.month);
    clampSelectedDate(current.year, current.month);
  };

  const getDayIndicatorClass = (progress) => {
    if (progress.total === 0) return "bg-gray-100";
    if (progress.rate === 0) return "bg-gray-300";
    if (progress.rate < 60) return "bg-gray-400";
    if (progress.rate < 80) return "bg-gray-500";
    if (progress.rate < 100) return "bg-gray-700";
    return "bg-gray-900";
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
          Monthly
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
          Month View
        </h1>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            ‹
          </button>

          <div className="flex-1 text-center">
            <p className="text-sm font-medium text-gray-900">{getMonthLabel(currentYear, currentMonth)}</p>
            {!isCurrentMonth && (
              <button
                type="button"
                onClick={goToCurrentMonth}
                className="mt-1 text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                Back to current month
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            ›
          </button>
        </div>

        {monthlyExpectedCompletions === 0 ? (
          <p className="rounded-xl bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
            No habits to track this month.
          </p>
        ) : (
          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium text-gray-500">Monthly Progress</p>
              <p className="text-sm tabular-nums text-gray-500">
                {monthlyCompletedCompletions} / {monthlyExpectedCompletions}
              </p>
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-label={`Monthly progress: ${monthlyPercentage} percent`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={monthlyPercentage}
            >
              <div
                className="h-full rounded-full bg-gray-900 transition-all duration-300"
                style={{ width: `${monthlyPercentage}%` }}
              />
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-gray-500">Daily Progress</p>
            <p className="text-xs text-gray-400">Past and current days</p>
          </div>

          {monthlyExpectedCompletions === 0 ? (
            <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No habit activity to display yet.
            </p>
          ) : (
            <div className="flex items-end gap-[2px] sm:gap-1" role="img" aria-label={`Daily completion progress for ${getMonthLabel(currentYear, currentMonth)}`}>
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const date = formatCalendarDate(currentYear, currentMonth, day);
                const progress = getDayProgress(date);
                const isDayFuture = date > today;
                const isDayToday = date === today;
                const hasData = progress.total > 0 && !isDayFuture;
                const barHeight = hasData ? progress.rate : 0;

                let barColor = "bg-gray-100";
                if (isDayFuture) {
                  barColor = "bg-gray-50";
                } else if (hasData) {
                  barColor = progress.rate === 0
                    ? "bg-gray-300"
                    : progress.rate < 60
                      ? "bg-gray-400"
                      : progress.rate < 80
                        ? "bg-gray-500"
                        : progress.rate < 100
                          ? "bg-gray-700"
                          : "bg-gray-900";
                }

                const tooltip = hasData
                  ? `${progress.completed} of ${progress.total} habits completed, ${barHeight}%`
                  : isDayFuture
                    ? "Future"
                    : "No habits";

                return (
                  <div
                    key={date}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <div className="relative flex h-20 w-full items-end sm:h-24">
                      <div
                        className={`w-full rounded-sm transition-all duration-200 ${barColor} ${isDayToday ? "ring-1 ring-inset ring-gray-900" : ""}`}
                        style={{ height: `${Math.max(barHeight, isDayFuture || !hasData ? 0 : 4)}%` }}
                        tabIndex={hasData ? 0 : -1}
                        aria-label={`Day ${day}: ${tooltip}`}
                        title={tooltip}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {monthlyExpectedCompletions > 0 && (
            <div className="flex justify-between text-[10px] text-gray-400 sm:text-xs">
              <span>1</span>
              <span>{Math.floor(daysInMonth / 2)}</span>
              <span>{daysInMonth}</span>
            </div>
          )}
        </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-7 gap-1 text-center sm:gap-2">
            {DAY_LABELS.map((label) => (
              <div key={label} className="py-2 text-[10px] font-semibold text-gray-400 sm:text-xs">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const date = formatCalendarDate(currentYear, currentMonth, day);
              const progress = getDayProgress(date);
              const isSelected = selectedDate === date;
              const isToday = date === today;
              const isFuture = date > today;
              const hasHabits = progress.total > 0;
                  const indicatorClass = getDayIndicatorClass(progress);

                  return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                    isSelected
                      ? "border-gray-900 ring-2 ring-gray-900 ring-offset-1"
                      : isToday
                        ? "border-gray-400"
                        : "border-transparent hover:border-gray-200"
                  }`}
                  aria-label={`${new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`))} — ${hasHabits ? `${progress.completed} of ${progress.total} completed` : "no habits"}`}
                  aria-pressed={isSelected}
                >
                  <span className={`text-xs font-medium tabular-nums sm:text-sm ${isFuture ? "text-gray-300" : ""}`}>
                    {day}
                  </span>
                  {hasHabits && (
                    <span
                      className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isFuture ? "bg-gray-200" : indicatorClass}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-gray-400 sm:text-xs">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-gray-100" />None</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-gray-300" />0%</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-gray-500" />In progress</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-gray-900" />Complete</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Selected date</p>
            <h2 className="mt-1 text-xl font-bold">
              {new Intl.DateTimeFormat(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }).format(new Date(`${selectedDate}T00:00:00`))}
            </h2>
          </div>
          {!isSelectedFuture && selectedDateHabits.length > 0 && (
            <div className="shrink-0 text-right">
              <p className="text-2xl font-bold">
                {getCompletedHabitCount(selectedDateHabits, completions, selectedDate)}
              </p>
              <p className="text-sm text-gray-500">completed</p>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {activeHabits.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No habits yet. Add a habit to start tracking.
            </p>
          ) : isSelectedFuture ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Future dates cannot be edited.
            </p>
          ) : selectedDateHabits.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No habits were scheduled for this day.
            </p>
          ) : (
            selectedDateHabits.map((habit) => {
              const completionDates = getCompletionDates(habit.id, completions);
              const currentStreak = calculateCurrentStreak(habit, completionDates, today);
              const completed = isHabitCompletedOnDate(habit.id, selectedDate, completions);

              return (
                <div
                  key={habit.id}
                  className={`flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 ${completed ? "bg-gray-50" : "bg-white"}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleCompletion(habit.id, selectedDate)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl ${completed ? "bg-gray-200" : "bg-gray-100"}`}>
                      {habit.icon}
                    </span>
                    <div className="min-w-0">
                      <p className={`truncate font-medium ${completed ? "text-gray-500 line-through" : "text-gray-900"}`}>
                        {habit.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
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
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCompletion(habit.id, selectedDate)}
                    aria-label={completed ? `Mark ${habit.name} as incomplete` : `Mark ${habit.name} as complete`}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                      completed
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-transparent hover:border-gray-400"
                    }`}
                  >
                    ✓
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default Monthly;
