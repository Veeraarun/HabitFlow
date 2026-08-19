function ProgressCard({ completed, total }) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium text-gray-500">
          Today's progress
        </p>
        {total > 0 && (
          <p className="text-2xl font-bold tabular-nums tracking-tight text-gray-900">
            {percentage}
            <span className="ml-0.5 text-base font-semibold text-gray-400">
              %
            </span>
          </p>
        )}
      </div>

      {total > 0 ? (
        <>
          <p className="mt-1 text-sm font-medium text-gray-600">
            <span className="font-bold text-gray-900">{completed}</span>
            <span className="text-gray-400"> / {total} completed</span>
          </p>

          <div
            className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
            role="progressbar"
            aria-label={`${completed} of ${total} due habits completed`}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={completed}
          >
            <div
              className="h-full rounded-full bg-gray-900 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </>
      ) : (
        <p className="mt-3 text-base font-semibold text-gray-900">
          No habits due today
        </p>
      )}
    </div>
  );
}

export default ProgressCard;
