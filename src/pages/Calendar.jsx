import { useEffect, useState } from "react";

import { getCompletions, getHabits } from "../db/database";
import { getTodayDate } from "../utils/dates";
import {
  formatCalendarDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  getHistoricalHabitsForDate,
} from "../utils/calendar";
import {
  getCompletedHabitCount,
  isHabitCompletedOnDate,
} from "../utils/completions";

function Calendar() {
  const today = new Date();
  const todayDate = getTodayDate();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedHabits, storedCompletions] = await Promise.all([
          getHabits(),
          getCompletions(),
        ]);
        setHabits(storedHabits);
        setCompletions(storedCompletions);
      } catch (error) {
        console.error("Failed to load calendar data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading calendar...</p>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = new Intl.DateTimeFormat(undefined, { month: "long" }).format(new Date(year, month));
  const selectedDateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${selectedDate}T00:00:00`));
  const isSelectedFuture = selectedDate > todayDate;

  const getDaySummary = (date) => {
    if (date > todayDate) {
      return { status: "future", completed: 0, expected: 0, rate: null };
    }

    const relevantHabits = getHistoricalHabitsForDate(habits, date, completions);
    if (relevantHabits.length === 0) {
      return { status: "none", completed: 0, expected: 0, rate: null };
    }

    const completed = getCompletedHabitCount(relevantHabits, completions, date);
    const rate = Math.round((completed / relevantHabits.length) * 100);

    return {
      status: rate === 0 ? "missed" : "tracked",
      completed,
      expected: relevantHabits.length,
      rate,
    };
  };

  const getDayIndicatorClass = (summary) => {
    if (summary.status === "future") return "border border-gray-200 bg-white";
    if (summary.status === "none") return "bg-gray-100";
    if (summary.rate === 0) return "bg-gray-300";
    if (summary.rate < 60) return "bg-gray-400";
    if (summary.rate < 80) return "bg-gray-500";
    if (summary.rate < 100) return "bg-gray-700";
    return "bg-gray-900";
  };

  const selectedHabits = isSelectedFuture
    ? []
    : getHistoricalHabitsForDate(habits, selectedDate, completions);
  const selectedCompletedCount = getCompletedHabitCount(selectedHabits, completions, selectedDate);

  const changeMonth = (offset) => {
    const nextDate = new Date(year, month + offset, 1);
    setYear(nextDate.getFullYear());
    setMonth(nextDate.getMonth());
  };

  const goToToday = () => {
    const currentDate = new Date();
    setYear(currentDate.getFullYear());
    setMonth(currentDate.getMonth());
    setSelectedDate(getTodayDate());
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Your history</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">Calendar</h1>
        <p className="mt-2 text-sm text-gray-500">Look back at your consistency.</p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6" aria-label="Habit history calendar">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold sm:text-xl">{monthName} {year}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToToday}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              →
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-1 text-center sm:gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="py-2 text-[10px] font-semibold text-gray-400 sm:text-xs">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: firstDay }).map((_, index) => <div key={`empty-${index}`} />)}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const date = formatCalendarDate(year, month, day);
            const summary = getDaySummary(date);
            const isSelected = selectedDate === date;
            const isToday = date === todayDate;
            const formattedDate = new Intl.DateTimeFormat(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            }).format(new Date(year, month, day));
            const statusLabel = summary.status === "future"
              ? "future date"
              : summary.status === "none"
                ? "nothing scheduled"
                : `${summary.rate} percent complete`;
            const fillClass = getDayIndicatorClass(summary);
            const lightText = fillClass === "bg-gray-500" || fillClass === "bg-gray-700" || fillClass === "bg-gray-900";

            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                aria-label={`${formattedDate} — ${statusLabel}`}
                aria-pressed={isSelected}
                className={`flex aspect-square flex-col items-center justify-center rounded-xl border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                  isSelected
                    ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
                    : "border-transparent hover:border-gray-200"
                } ${isToday ? "ring-1 ring-inset ring-gray-900/15" : ""} ${fillClass} ${lightText ? "text-white" : ""}`}
              >
                <span className="text-xs font-semibold tabular-nums sm:text-sm">{day}</span>
                {summary.status !== "future" && (
                  <span className={`mt-1 h-1.5 w-1.5 rounded-full ${lightText ? "bg-white/80" : "bg-gray-400"}`} />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-gray-100" />None scheduled</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-gray-300" />0%</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-gray-500" />In progress</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-gray-900" />Complete</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border border-gray-200 bg-white" />Future</span>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" aria-labelledby="selected-date-heading">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Selected date</p>
            <h2 id="selected-date-heading" className="mt-1 text-xl font-bold">{selectedDateLabel}</h2>
          </div>
          {!isSelectedFuture && selectedHabits.length > 0 && (
            <div className="shrink-0 text-right">
              <p className="text-2xl font-bold">{selectedCompletedCount}</p>
              <p className="text-sm text-gray-500">completed</p>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {habits.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No habits yet.</p>
          ) : isSelectedFuture ? (
            <p className="py-8 text-center text-sm text-gray-400">Future dates do not have completion history yet.</p>
          ) : selectedHabits.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Nothing was scheduled for this day.</p>
          ) : (
            selectedHabits.map((habit) => {
              const completed = isHabitCompletedOnDate(habit.id, selectedDate, completions);

              return (
                <div
                  key={habit.id}
                  className={`flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 ${completed ? "bg-gray-50" : "bg-white"}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl" aria-hidden="true">{habit.icon}</span>
                    <div className="min-w-0">
                      <p className={`truncate font-medium ${completed ? "text-gray-700" : "text-gray-900"}`}>{habit.name}</p>
                      {!habit.active && (
                        <span className="mt-1 inline-block rounded-md bg-gray-200 px-2 py-0.5 text-xs text-gray-500">Archived</span>
                      )}
                    </div>
                  </div>
                  <span
                    aria-label={completed ? "Completed" : "Not completed"}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${completed ? "bg-gray-900 text-white" : "border-2 border-gray-300 text-transparent"}`}
                  >
                    ✓
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default Calendar;
