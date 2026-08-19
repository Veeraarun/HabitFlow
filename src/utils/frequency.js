export function isHabitDueOnDate(
  habit,
  dateString,
) {
  if (!habit.frequency) {
    return true;
  }

  const { type, days } = habit.frequency;

  if (type === "daily") {
    return true;
  }

  if (type === "specific_days") {
    const [year, month, day] =
      dateString.split("-").map(Number);

    const date = new Date(
      year,
      month - 1,
      day,
    );

    const dayOfWeek = date.getDay();

    return (
      days?.includes(dayOfWeek) ?? false
    );
  }

  if (type === "weekly") {
    return true;
  }

  return true;
}

export function getWeekStart(dateString) {
  const [year, month, day] =
    dateString.split("-").map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  const dayOfWeek = date.getDay();

  const mondayOffset =
    dayOfWeek === 0
      ? -6
      : 1 - dayOfWeek;

  date.setDate(
    date.getDate() + mondayOffset,
  );

  const resultYear =
    date.getFullYear();

  const resultMonth = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const resultDay = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${resultYear}-${resultMonth}-${resultDay}`;
}

function getMondayPosition(date) {
  const dayOfWeek = date.getDay();

  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

export function getDateOffset(
  dateString,
  offset,
) {
  const [year, month, day] =
    dateString.split("-").map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  date.setDate(
    date.getDate() + offset,
  );

  const resultYear =
    date.getFullYear();

  const resultMonth = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const resultDay = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${resultYear}-${resultMonth}-${resultDay}`;
}

export function getWeeklyCompletionCount(
  habitId,
  completions,
  dateString,
) {
  const weekStart =
    getWeekStart(dateString);

  const weekDates = Array.from(
    { length: 7 },
    (_, index) =>
      getDateOffset(
        weekStart,
        index,
      ),
  );

  return completions.filter(
    (completion) =>
      completion.habitId === habitId &&
      completion.completed === true &&
      weekDates.includes(
        completion.date,
      ),
  ).length;
}

export function isWeeklyHabitComplete(
  habit,
  completions,
  dateString,
) {
  if (
    habit.frequency?.type !==
    "weekly"
  ) {
    return false;
  }

  const target =
    habit.frequency.target || 1;

  const completed =
    getWeeklyCompletionCount(
      habit.id,
      completions,
      dateString,
    );

  return completed >= target;
}

export function getExpectedCompletions(
  habit,
  startDate,
  endDate,
) {
  const frequency = habit.frequency || { type: "daily" };

  const createdDate = habit.createdAt?.slice(0, 10);
  const effectiveStart = createdDate && createdDate > startDate
    ? createdDate
    : startDate;
  if (effectiveStart > endDate) {
    return 0;
  }

  const start = new Date(`${effectiveStart}T00:00:00`);

  const end = new Date(
    `${endDate}T00:00:00`,
  );

  if (frequency.type === "weekly") {
    const target = frequency.target || 1;

    // Monday-based occurrence model: at most `target` expected completions
    // per week. A not-yet-finished partial week contributes only its elapsed
    // portion (capped at `target`), so the current week never assumes the
    // full target was already expected. `pos` is the 0-based index of the
    // day within its Monday-start week (Mon=0 … Sun=6).
    const toDateParts = (dateString) => {
      const [year, month, day] = dateString.split("-").map(Number);
      return { year, month, day, date: new Date(year, month - 1, day) };
    };

    const toMondayStart = (dateString) => {
      const { year, month, day, date } = toDateParts(dateString);
      const offset = getMondayPosition(date); // 0 for Monday … 6 for Sunday
      return new Date(year, month - 1, day - offset);
    };

    const startMonday = toMondayStart(effectiveStart);
    const endMonday = toMondayStart(endDate);

    const startPos = getMondayPosition(toDateParts(effectiveStart).date);
    const endPos = getMondayPosition(toDateParts(endDate).date);

    if (startMonday.getTime() === endMonday.getTime()) {
      // Entire range falls inside one Monday-based week.
      return Math.min(endPos - startPos + 1, target);
    }

    // Crosses one or more week boundaries: partial start week + full weeks
    // in between + partial end week, each capped at `target`.
    const totalDays = Math.round(
      (toDateParts(endDate).date - toDateParts(effectiveStart).date) /
        (1000 * 60 * 60 * 24),
    );
    const fullWeeks = Math.floor((totalDays - (endPos + (6 - startPos))) / 7);

    return (
      Math.min(6 - startPos + 1, target) +
      fullWeeks * target +
      Math.min(endPos + 1, target)
    );
  }

  let count = 0;

  const current = new Date(start);

  while (current <= end) {
    if (
      frequency.type === "daily"
    ) {
      count += 1;
    }

    else if (
      frequency.type ===
      "specific_days"
    ) {
      const dayOfWeek =
        current.getDay();

      if (
        frequency.days?.includes(
          dayOfWeek,
        )
      ) {
        count += 1;
      }
    }

    current.setDate(
      current.getDate() + 1,
    );
  }

  return count;
}

export function getFrequencyLabel(habit) {
  const frequency = habit.frequency || { type: "daily" };

  if (frequency.type === "weekly") {
    const target = frequency.target || 1;
    return `${target} ${target === 1 ? "time" : "times"} this week`;
  }

  if (frequency.type === "specific_days") {
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (frequency.days || []).map((day) => dayLabels[day]).join(" · ") || "Specific days";
  }

  return "Every day";
}
