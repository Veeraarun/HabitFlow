function toDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatDate(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateString, amount) {
  const date = toDate(dateString);

  date.setDate(date.getDate() + amount);

  return formatDate(date);
}

function getDayOfWeek(dateString) {
  return toDate(dateString).getDay();
}

function getWeekStart(dateString) {
  const date = toDate(dateString);

  const day = date.getDay();

  const mondayOffset = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + mondayOffset);

  return formatDate(date);
}

function getWeekDates(weekStart) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function calculateDailyStreak(
  completionDates,
  today,
  graceDays = 1,
) {
  const completedDates = new Set(
    completionDates,
  );

  let streak = 0;
  let currentDate = today;
  let remainingGraceDays = graceDays;
  let foundCompletion = false;

  while (true) {
    if (completedDates.has(currentDate)) {
      streak += 1;
      foundCompletion = true;
      remainingGraceDays = graceDays;

      currentDate = addDays(
        currentDate,
        -1,
      );

      continue;
    }

    // Do not start a streak from grace alone.
    if (!foundCompletion) {
      break;
    }

    if (remainingGraceDays > 0) {
      remainingGraceDays -= 1;

      currentDate = addDays(
        currentDate,
        -1,
      );

      continue;
    }

    break;
  }

  return streak;
}

export function calculateScheduledStreak(
  completionDates,
  frequencyDays,
  today,
  graceDays = 1,
) {
  const completedDates = new Set(
    completionDates,
  );

  let streak = 0;
  let currentDate = today;
  let remainingGraceDays = graceDays;
  let foundCompletion = false;

  while (true) {
    const dayOfWeek =
      getDayOfWeek(currentDate);

    const isScheduled =
      frequencyDays.includes(
        dayOfWeek,
      );

    if (!isScheduled) {
      currentDate = addDays(
        currentDate,
        -1,
      );

      continue;
    }

    if (completedDates.has(currentDate)) {
      streak += 1;
      foundCompletion = true;
      remainingGraceDays = graceDays;

      currentDate = addDays(
        currentDate,
        -1,
      );

      continue;
    }

    if (!foundCompletion) {
      break;
    }

    if (remainingGraceDays > 0) {
      remainingGraceDays -= 1;

      currentDate = addDays(
        currentDate,
        -1,
      );

      continue;
    }

    break;
  }

  return streak;
}

export function calculateWeeklyStreak(completionDates, weeklyTarget, today) {
  const completedDates = new Set(completionDates);

  let currentWeek = getWeekStart(today);

  let streak = 0;

  while (true) {
    const weekDates = getWeekDates(currentWeek);

    const completedThisWeek = weekDates.filter((date) =>
      completedDates.has(date),
    ).length;

    if (completedThisWeek < weeklyTarget) {
      break;
    }

    streak += 1;

    currentWeek = addDays(currentWeek, -7);
  }

  return streak;
}

export function calculateCurrentStreak(
  habit,
  completionDates,
  today,
  graceDays = 1,
) {
  const frequency = habit.frequency || {
    type: "daily",
  };

  if (frequency.type === "weekly") {
    return calculateWeeklyStreak(completionDates, frequency.target || 1, today);
  }

  if (frequency.type === "specific_days") {
    return calculateScheduledStreak(
      completionDates,
      frequency.days || [],
      today,
      graceDays,
    );
  }

  return calculateDailyStreak(completionDates, today, graceDays);
}

export function calculateLongestStreak(habit, completionDates, graceDays = 1) {
  const frequency = habit.frequency || {
    type: "daily",
  };

  const completedDates = new Set(completionDates);

  if (completedDates.size === 0) {
    return 0;
  }

  if (frequency.type === "weekly") {
    return calculateLongestWeeklyStreak(completionDates, frequency.target || 1);
  }

  if (frequency.type === "specific_days") {
    return calculateLongestScheduledStreak(
      completionDates,
      frequency.days || [],
      graceDays,
    );
  }

  return calculateLongestDailyStreak(completionDates, graceDays);
}
function calculateLongestDailyStreak(
  completionDates,
  graceDays = 1,
) {
  const sortedDates = [
    ...new Set(completionDates),
  ].sort();

  if (sortedDates.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;
  let graceUsed = 0;

  for (
    let i = 1;
    i < sortedDates.length;
    i++
  ) {
    const previousDate =
      sortedDates[i - 1];

    const currentDate =
      sortedDates[i];

    const difference = Math.round(
      (
        toDate(currentDate) -
        toDate(previousDate)
      ) /
        (1000 * 60 * 60 * 24),
    );

    if (difference === 1) {
      current += 1;
      graceUsed = 0;

      longest = Math.max(
        longest,
        current,
      );

      continue;
    }

    if (
      difference === 2 &&
      graceDays > 0 &&
      graceUsed < graceDays
    ) {
      current += 1;
      graceUsed += 1;

      longest = Math.max(
        longest,
        current,
      );

      continue;
    }

    current = 1;
    graceUsed = 0;
  }

  return longest;
}

function calculateLongestScheduledStreak(
  completionDates,
  frequencyDays,
  graceDays = 1,
) {
  const sortedDates = [...new Set(completionDates)].sort();

  if (sortedDates.length === 0) {
    return 0;
  }

  const completedDates = new Set(sortedDates);

  let longest = 0;
  let current = 0;
  let missedOccurrences = 0;

  const firstDate = sortedDates[0];

  const lastDate = sortedDates[sortedDates.length - 1];

  let date = firstDate;

  while (date <= lastDate) {
    const dayOfWeek = getDayOfWeek(date);

    if (frequencyDays.includes(dayOfWeek)) {
      if (completedDates.has(date)) {
        current += 1;
        missedOccurrences = 0;

        longest = Math.max(longest, current);
      } else if (missedOccurrences < graceDays) {
        missedOccurrences += 1;

        current += 1;

        longest = Math.max(longest, current);
      } else {
        current = 0;
        missedOccurrences = 0;
      }
    }

    date = addDays(date, 1);
  }

  return longest;
}

function calculateLongestWeeklyStreak(completionDates, weeklyTarget) {
  if (completionDates.length === 0) {
    return 0;
  }

  const uniqueDates = [...new Set(completionDates)].sort();

  const firstWeek = getWeekStart(uniqueDates[0]);

  const lastWeek = getWeekStart(uniqueDates[uniqueDates.length - 1]);

  let week = firstWeek;
  let longest = 0;
  let current = 0;

  while (week <= lastWeek) {
    const weekDates = getWeekDates(week);

    const count = weekDates.filter((date) => uniqueDates.includes(date)).length;

    if (count >= weeklyTarget) {
      current += 1;

      longest = Math.max(longest, current);
    } else {
      current = 0;
    }

    week = addDays(week, 7);
  }

  return longest;
}
