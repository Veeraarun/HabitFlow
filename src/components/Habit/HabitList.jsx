import HabitCard from "./HabitCard";

function HabitList({ habits, hasActiveHabits, onToggle, onEdit, onArchive }) {
  const completedCount = habits.filter((habit) => habit.isCompleted).length;
  const allComplete = habits.length > 0 && completedCount === habits.length;

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Today&apos;s Habits</h2>
          <p className="mt-1 text-sm text-gray-500">
            {allComplete ? "All done for today." : "Keep your momentum going."}
          </p>
        </div>

        {habits.length > 0 && (
          <span className="shrink-0 text-sm font-medium text-gray-500">
            {completedCount} / {habits.length} completed
          </span>
        )}
      </div>

      {habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
          <p className="font-semibold text-gray-900">
            {hasActiveHabits ? "Nothing scheduled for today." : "No habits yet."}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {hasActiveHabits
              ? "Your next scheduled habits will appear on their assigned days."
              : "Add your first habit to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div key={habit.id}>
              <HabitCard
                icon={habit.icon}
                name={habit.name}
                category={habit.category}
                frequencyLabel={habit.frequencyLabel}
                completed={habit.isCompleted}
                onToggle={() => onToggle(habit.id)}
                onEdit={() => onEdit(habit)}
                onArchive={() => onArchive(habit.id)}
              />

              {habit.frequency?.type === "weekly" && (
                <p
                  className={`ml-4 mt-2 text-xs ${
                    habit.weeklyCompleted >= habit.weeklyTarget
                      ? "font-medium text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {habit.weeklyCompleted} / {habit.weeklyTarget} this week
                  {habit.weeklyCompleted >= habit.weeklyTarget && (
                    <span className="ml-2">Target reached</span>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HabitList;
