function DashboardHeader() {
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Today
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
        {formattedDate}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Build better days, one habit at a time.
      </p>
    </div>
  );
}

export default DashboardHeader;
