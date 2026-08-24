export function getTodayDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDate(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDateDaysAgo(days) {
  const date = new Date();

  date.setDate(date.getDate() - days);

  return formatDate(date);
}

export function addDaysToDate(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  date.setDate(date.getDate() + days);

  return formatDate(date);
}

export function getWeekStartDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  const dayOfWeek = date.getDay();

  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  date.setDate(date.getDate() + mondayOffset);

  return formatDate(date);
}

export function getWeekDates(weekStart) {
  return Array.from({ length: 7 }, (_, index) => addDaysToDate(weekStart, index));
}

export function getWeekLabel(weekStart) {
  const weekEnd = addDaysToDate(weekStart, 6);

  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(`${weekEnd}T00:00:00`);

  const startLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(start);

  const endLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(end);

  return `${startLabel} – ${endLabel}`;
}

export function getMonthStart(year, month) {
  return { year, month };
}

export function getNextMonth(year, month) {
  if (month === 11) {
    return { year: year + 1, month: 0 };
  }
  return { year, month: month + 1 };
}

export function getPreviousMonth(year, month) {
  if (month === 0) {
    return { year: year - 1, month: 11 };
  }
  return { year, month: month - 1 };
}

export function getMonthLabel(year, month) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
}

export function getCurrentMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}