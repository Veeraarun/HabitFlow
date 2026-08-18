function ProgressCard({ completed, total }) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <p className="text-sm font-medium text-gray-500">Today&apos;s progress</p>

      {total > 0 ? (
        <>
          <div className="mt-2 flex items-end justify-between gap-4">
            <p className="text-3xl font-bold text-gray-900">
              {completed} / {total}
            </p>
            <p className="text-sm font-medium text-gray-500">{percentage}% complete</p>
          </div>

          <div
            className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100"
            aria-label={`${completed} of ${total} due habits completed`}
          >
            <div
              className="h-full rounded-full bg-gray-900 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </>
      ) : (
        <p className="mt-3 text-lg font-semibold text-gray-900">No habits due today</p>
      )}
    </div>
  );
}

export default ProgressCard;
