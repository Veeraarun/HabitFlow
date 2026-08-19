import { useEffect, useState } from "react";
import {
  deleteCompletion,
  getCompletions,
  getHabits,
  saveCompletion,
  saveHabit,
} from "../db/database";

import DashboardHeader from "../components/Dashboard/DashboardHeader";
import ProgressCard from "../components/Dashboard/ProgressCard";
import StreakCard from "../components/Dashboard/StreakCard";
import ActivityPreview from "../components/Dashboard/ActivityPreview";
import HabitList from "../components/Habit/HabitList";
import AddHabitModal from "../components/Habit/AddHabitModal";
import EditHabitModal from "../components/Habit/EditHabitModal";

import { getTodayDate } from "../utils/dates";
import { getSettings } from "../utils/settings";

import {
  calculateCurrentStreak,
  calculateLongestStreak,
} from "../utils/streaks";

import {
  getFrequencyLabel,
  getWeeklyCompletionCount,
  isHabitDueOnDate,
} from "../utils/frequency";

import {
  getCompletedHabitCount,
  getCompletionDates,
  isHabitCompletedOnDate,
} from "../utils/completions";

function Today({ openAddRequest = 0 }) {
  const [habits, setHabits] = useState([]);

  const [completions, setCompletions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editingHabit, setEditingHabit] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [graceDays, setGraceDays] = useState(1);

  const today = getTodayDate();

  const dueHabits = habits.filter(
    (habit) => habit.active && isHabitDueOnDate(habit, today),
  );

  const habitsWithProgress = dueHabits.map((habit) => {
    const isWeeklyHabit = habit.frequency?.type === "weekly";

    const weeklyCompleted = isWeeklyHabit
      ? getWeeklyCompletionCount(habit.id, completions, today)
      : null;

    return {
      ...habit,

      isCompleted: isHabitCompletedOnDate(habit.id, today, completions),

      frequencyLabel: getFrequencyLabel(habit),

      weeklyCompleted,

      weeklyTarget: isWeeklyHabit ? habit.frequency.target || 1 : null,
    };
  });

  const completedCount = getCompletedHabitCount(dueHabits, completions, today);

  const activeHabitStreaks = dueHabits.map((habit) => {
    const completionDates = getCompletionDates(habit.id, completions);

    return {
      current: calculateCurrentStreak(habit, completionDates, today, graceDays),

      longest: calculateLongestStreak(habit, completionDates, graceDays),
    };
  });

  const currentStreak = Math.max(
    0,
    ...activeHabitStreaks.map((streak) => streak.current),
  );

  const longestStreak = Math.max(
    0,
    ...activeHabitStreaks.map((streak) => streak.longest),
  );

  const toggleHabit = async (id) => {
    const habit = habits.find((item) => item.id === id);

    if (!habit) {
      return;
    }

    const wasCompleted = isHabitCompletedOnDate(id, today, completions);

    const completion = {
      id: `${id}-${today}`,
      habitId: id,
      date: today,
      completed: true,
    };

    setCompletions((items) =>
      wasCompleted
        ? items.filter((item) => item.id !== completion.id)
        : [...items.filter((item) => item.id !== completion.id), completion],
    );

    try {
      if (wasCompleted) {
        await deleteCompletion(id, today);
      } else {
        await saveCompletion(completion);
      }
    } catch (error) {
      setCompletions((items) =>
        wasCompleted
          ? [...items, completion]
          : items.filter((item) => item.id !== completion.id),
      );

      console.error("Failed to save completion:", error);
    }
  };

  const addHabit = async (newHabit) => {
    const habit = {
      id: Date.now(),
      ...newHabit,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setHabits((items) => [...items, habit]);

    try {
      await saveHabit(habit);
    } catch (error) {
      setHabits((items) => items.filter((item) => item.id !== habit.id));

      console.error("Failed to save new habit:", error);
    }
  };

  const saveEditedHabit = async (updatedHabit) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === updatedHabit.id
        ? {
            ...habit,
            ...updatedHabit,
          }
        : habit,
    );

    setHabits(updatedHabits);

    try {
      await saveHabit(
        updatedHabits.find((habit) => habit.id === updatedHabit.id),
      );
    } catch (error) {
      setHabits(habits);

      console.error("Failed to save edited habit:", error);
    }
  };

  const archiveHabit = async (id) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === id
        ? {
            ...habit,
            active: false,
          }
        : habit,
    );

    setHabits(updatedHabits);

    try {
      await saveHabit(updatedHabits.find((habit) => habit.id === id));
    } catch (error) {
      setHabits(habits);

      console.error("Failed to archive habit:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedHabits, storedCompletions] = await Promise.all([
          getHabits(),
          getCompletions(),
        ]);

        const settings = getSettings();

        setHabits(storedHabits);

        setCompletions(storedCompletions);

        setGraceDays(settings.graceDays);
      } catch (error) {
        console.error("Failed to load habits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
      {/*
        Mobile: one column ordered Date, Progress, Streak, Habit List, Activity.
        Desktop: two columns (~35% / ~65%) with the habit list spanning both rows
        on the right and the activity card sitting under the streak card on the left.
      */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[7fr_13fr] lg:gap-8">
        {/* Left column, top: date, progress, streak */}
        <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-1">
          <DashboardHeader />

          <ProgressCard completed={completedCount} total={dueHabits.length} />

          <StreakCard
            currentStreak={currentStreak}
            longestStreak={longestStreak}
          />
        </div>

        {/* Right column: habit list dominates */}
        <div className="flex flex-col gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <HabitList
            habits={habitsWithProgress}
            hasActiveHabits={habits.some((habit) => habit.active)}
            onToggle={toggleHabit}
            onEdit={(habit) => {
              setEditingHabit(habit);
              setIsEditModalOpen(true);
            }}
            onArchive={archiveHabit}
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

        {/* Left column, bottom on desktop / last on mobile: activity */}
        <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <ActivityPreview habits={habits} completions={completions} />
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
        onSave={saveEditedHabit}
      />
    </>
  );
}

export default Today;