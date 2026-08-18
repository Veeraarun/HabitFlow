function DashboardHeader() {
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div>
      <p className="text-sm font-medium text-gray-500">Today</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
        {formattedDate}
      </h1>
    </div>
  );
}

export default DashboardHeader;
