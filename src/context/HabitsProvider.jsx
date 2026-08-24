import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  getHabits,
  getCompletions,
  saveHabit,
  saveCompletion,
  deleteCompletion,
  deleteHabit,
} from "../db/database";
import { HabitsContext } from "./HabitsContext";
import { getTodayDate } from "../utils/dates";

export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const inFlightKeys = useRef(new Set());

  const refreshData = useCallback(async () => {
    try {
      const [storedHabits, storedCompletions] = await Promise.all([
        getHabits(),
        getCompletions(),
      ]);

      setHabits(storedHabits);
      setCompletions(storedCompletions);
    } catch (error) {
      console.error("Failed to load habit data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addHabit = useCallback(async (habitData) => {
    const habit = {
      id: Date.now(),
      ...habitData,
      active: true,
      createdAt: getTodayDate(),
    };

    setHabits((items) => [...items, habit]);

    try {
      await saveHabit(habit);
    } catch (error) {
      setHabits((items) => items.filter((item) => item.id !== habit.id));
      console.error("Failed to save new habit:", error);
    }
  }, []);

  const updateHabit = useCallback(async (habitData) => {
    const previousHabits = habits;

    setHabits((items) =>
      items.map((habit) =>
        habit.id === habitData.id
          ? { ...habit, ...habitData }
          : habit,
      ),
    );

    try {
      const updated = {
        ...previousHabits.find((habit) => habit.id === habitData.id),
        ...habitData,
      };
      await saveHabit(updated);
    } catch (error) {
      setHabits(previousHabits);
      console.error("Failed to save edited habit:", error);
    }
  }, [habits]);

  const toggleCompletion = useCallback(async (habitId, date) => {
    const completionId = `${habitId}-${date}`;

    if (inFlightKeys.current.has(completionId)) {
      return;
    }

    inFlightKeys.current.add(completionId);

    const completion = {
      id: completionId,
      habitId,
      date,
      completed: true,
    };

    const wasCompleted = completions.some(
      (item) => item.id === completionId,
    );

    setCompletions((items) =>
      wasCompleted
        ? items.filter((item) => item.id !== completionId)
        : [...items, completion],
    );

    try {
      if (wasCompleted) {
        await deleteCompletion(habitId, date);
      } else {
        await saveCompletion(completion);
      }
    } catch (error) {
      setCompletions((items) =>
        wasCompleted
          ? [...items, completion]
          : items.filter((item) => item.id !== completionId),
      );
      console.error("Failed to save completion:", error);
    } finally {
      inFlightKeys.current.delete(completionId);
    }
  }, [completions]);

  const deleteHabitPermanent = useCallback(async (habitId) => {
    const previousHabits = habits;
    const previousCompletions = completions;

    setHabits((items) => items.filter((item) => item.id !== habitId));
    setCompletions((items) =>
      items.filter((item) => item.habitId !== habitId),
    );

    try {
      await deleteHabit(habitId);
    } catch (error) {
      setHabits(previousHabits);
      setCompletions(previousCompletions);
      console.error("Failed to delete habit:", error);
    }
  }, [habits, completions]);

  const value = {
    habits,
    completions,
    isLoading,
    addHabit,
    updateHabit,
    toggleCompletion,
    deleteHabit: deleteHabitPermanent,
    refreshData,
  };

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}
