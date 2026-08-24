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

    const toDateParts = (dateString) => {
      const [year, month, day] = dateString.split("-").map(Number);
      return { year, month, day, date: new Date(year, month - 1, day) };
    };

    const toMondayStart = (dateString) => {
      const { year, month, day, date } = toDateParts(dateString);
      const offset = getMondayPosition(date);
      return new Date(year, month - 1, day - offset);
    };

    const startMonday = toMondayStart(effectiveStart);
    const endMonday = toMondayStart(endDate);

    const startPos = getMondayPosition(toDateParts(effectiveStart).date);
    const endPos = getMondayPosition(toDateParts(endDate).date);

    if (startMonday.getTime() === endMonday.getTime()) {
      return Math.min(endPos - startPos + 1, target);
    }

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
