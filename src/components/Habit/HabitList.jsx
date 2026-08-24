import HabitCard from "./HabitCard";

function HabitList({ habits, future = false, onToggle, onEdit, onDelete }) {
  const completedCount = habits.filter((habit) => habit.isCompleted).length;
  const allComplete = habits.length > 0 && completedCount === habits.length;

  return (
    <section className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {future ? "Scheduled Habits" : "Habits"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {future
              ? "Future day — completions cannot be changed."
              : allComplete
                ? "All done."
                : "Keep your momentum going."}
          </p>
        </div>

        {habits.length > 0 && !future && (
          <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {completedCount} / {habits.length} completed
          </span>
        )}
      </div>

      <div className="flex-1 p-4 sm:p-5">
        {habits.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center">
            <p className="font-semibold text-gray-900">
              No habits yet.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Add your first habit to get started.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                icon={habit.icon}
                name={habit.name}
                completed={habit.isCompleted}
                streak={habit.currentStreak}
                reminderTime={habit.reminder?.enabled ? habit.reminder.time : null}
                disabled={future}
                onToggle={() => onToggle(habit.id)}
                onEdit={() => onEdit(habit)}
                onDelete={() => onDelete(habit.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default HabitList;
