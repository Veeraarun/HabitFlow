function StreakCard({
  currentStreak,
  longestStreak,
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

      <p className="text-sm font-medium text-gray-500">
        Current Streak
      </p>

      <div className="mt-3 flex items-center gap-3">

        <span className="text-3xl">
          🔥
        </span>

        <div>
          <p className="text-3xl font-bold text-gray-900">
            {currentStreak}
          </p>

          <p className="text-sm text-gray-500">
            days
          </p>
        </div>

      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">

        <p className="text-sm text-gray-500">
          Longest streak
        </p>

        <p className="mt-1 font-semibold text-gray-900">
          {longestStreak} days
        </p>

      </div>

    </div>
  );
}

export default StreakCard;