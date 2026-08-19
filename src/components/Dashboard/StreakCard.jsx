function StreakCard({ currentStreak, longestStreak }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Current streak</p>
          <div className="mt-2 flex items-center gap-2.5">
            <span className="text-2xl leading-none" aria-hidden="true">
              🔥
            </span>
            <p className="text-3xl font-bold tabular-nums tracking-tight text-gray-900">
              {currentStreak}
              <span className="ml-1.5 text-sm font-semibold text-gray-400">
                days
              </span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Best
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-gray-900">
            {longestStreak}
            <span className="ml-1 text-xs font-semibold text-gray-400">
              days
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-500">
        <span className="font-medium text-gray-700">{longestStreak} days</span>{" "}
        is your longest streak
      </div>
    </div>
  );
}

export default StreakCard;
