import { useEffect, useState } from "react";

function EditHabitModal({ habit, isOpen, onClose, onSave }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("20:00");

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setIcon(habit.icon);

      const reminder = habit.reminder || {
        enabled: false,
        time: "20:00",
      };

      setReminderEnabled(reminder.enabled);
      setReminderTime(reminder.time || "20:00");
    }
  }, [habit]);

  if (!isOpen || !habit) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onSave({
      id: habit.id,
      name: trimmedName,
      frequency: {
        type: "daily",
      },
      reminder: {
        enabled: reminderEnabled,
        time: reminderEnabled ? reminderTime : null,
      },
      icon: icon || "🎯",
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-habit-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="edit-habit-title" className="text-xl font-bold">
              Edit Habit
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update your habit details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit habit dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Habit name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Icon</label>

            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={2}
              className="mt-2 w-20 rounded-lg border border-gray-300 px-4 py-3 text-center text-xl outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Reminder
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Get a reminder for this habit.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={reminderEnabled}
                aria-label="Enable habit reminder"
                onClick={() =>
                  setReminderEnabled(
                    (enabled) => !enabled,
                  )
                }
                className={`relative h-7 w-12 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                  reminderEnabled
                    ? "bg-gray-900"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    reminderEnabled
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            {reminderEnabled && (
              <div className="mt-3">
                <label
                  htmlFor="edit-habit-reminder-time"
                  className="text-sm font-medium text-gray-700"
                >
                  Reminder time
                </label>

                <input
                  id="edit-habit-reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(event) =>
                    setReminderTime(event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditHabitModal;
