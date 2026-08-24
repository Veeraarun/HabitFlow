import { useEffect, useState } from "react";
import { useHabits } from "../hooks/useHabits";

import HabitList from "../components/Habit/HabitList";
import AddHabitModal from "../components/Habit/AddHabitModal";
import EditHabitModal from "../components/Habit/EditHabitModal";

import { addDaysToDate, getTodayDate } from "../utils/dates";

import { isHabitDueOnDate } from "../utils/frequency";

import {
  getCompletedHabitCount,
  getCompletionDates,
  isHabitCompletedOnDate,
} from "../utils/completions";

import { calculateCurrentStreak } from "../utils/streaks";

function Today({ openAddRequest = 0 }) {
  const {
    habits,
    completions,
    isLoading,
    addHabit,
    updateHabit,
    toggleCompletion,
    deleteHabit: deleteHabitPermanent,
  } = useHabits();

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const today = getTodayDate();
  const isFuture = selectedDate > today;
  const isToday = selectedDate === today;

  const existingHabits = habits.filter(
    (habit) => habit.active && isHabitDueOnDate(habit, selectedDate),
  );

  const datedHabits = existingHabits.filter((habit) => {
    const createdDate = habit.createdAt?.slice(0, 10);
    return !createdDate || createdDate <= selectedDate;
  });

  const habitsWithProgress = datedHabits.map((habit) => {
    const completionDates = getCompletionDates(habit.id, completions);

    return {
      ...habit,
      isCompleted: isHabitCompletedOnDate(habit.id, selectedDate, completions),
      currentStreak: calculateCurrentStreak(habit, completionDates, today),
    };
  });

  const completedCount = getCompletedHabitCount(datedHabits, completions, selectedDate);
  const totalCount = datedHabits.length;
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${selectedDate}T00:00:00`));

  const goToPreviousDay = () => {
    setSelectedDate((current) => addDaysToDate(current, -1));
  };

  const goToNextDay = () => {
    setSelectedDate((current) => addDaysToDate(current, 1));
  };

  const goToToday = () => {
    setSelectedDate(today);
  };

  useEffect(() => {
    if (openAddRequest > 0) {
      setIsAddModalOpen(true);
    }
  }, [openAddRequest]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading your habits...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Daily
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            {isToday ? "Today" : formattedDate}
          </h1>
        </div>

        <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goToPreviousDay}
              aria-label="Previous day"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              ‹
            </button>

            <div className="flex-1 text-center">
              <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
              {!isToday && (
                <button
                  type="button"
                  onClick={goToToday}
                  className="mt-1 text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  Back to today
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={goToNextDay}
              aria-label="Next day"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              ›
            </button>
          </div>

          {isFuture ? (
            <p className="rounded-xl bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
              Future day &mdash; completions cannot be changed.
            </p>
          ) : totalCount === 0 ? (
            <p className="rounded-xl bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
              No habits scheduled for this day.
            </p>
          ) : (
            <div>
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-gray-500">Progress</p>
                <p className="text-sm tabular-nums text-gray-500">
                  {completedCount} / {totalCount}
                </p>
              </div>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100"
                role="progressbar"
                aria-label={`${completedCount} of ${totalCount} habits completed`}
                aria-valuemin={0}
                aria-valuemax={totalCount}
                aria-valuenow={completedCount}
              >
                <div
                  className="h-full rounded-full bg-gray-900 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <HabitList
            habits={habitsWithProgress}
            future={isFuture}
            onToggle={(id) => toggleCompletion(id, selectedDate)}
            onDelete={deleteHabitPermanent}
          />

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <span className="text-base leading-none" aria-hidden="true">
              +
            </span>
            Add Habit
          </button>
        </div>
      </div>

      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addHabit}
      />

      <EditHabitModal
        habit={editingHabit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={updateHabit}
      />
    </>
  );
}

export default Today;
