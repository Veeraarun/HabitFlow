import { useEffect, useState } from "react";

function EditHabitModal({ habit, isOpen, onClose, onSave }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [category, setCategory] = useState("");
  const [frequencyType, setFrequencyType] = useState("daily");
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [selectedDays, setSelectedDays] = useState([1, 3, 5]);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const [reminderTime, setReminderTime] = useState("20:00");

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setIcon(habit.icon);
      setCategory(habit.category);
      const frequency = habit.frequency || { type: "daily" };
      setFrequencyType(frequency.type);
      setWeeklyTarget(frequency.target || 3);
      setSelectedDays(frequency.days || [1, 3, 5]);

      const reminder = habit.reminder || {
        enabled: false,
        time: "20:00",
      };

      setReminderEnabled(reminder.enabled);
      setReminderTime(reminder.time || "20:00");
    }
  }, [habit]);

  const toggleDay = (day) => {
    setSelectedDays((days) =>
      days.includes(day)
        ? days.filter((selectedDay) => selectedDay !== day)
        : [...days, day].sort(),
    );
  };

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
    type: frequencyType,
    ...(frequencyType === "weekly"
      ? { target: weeklyTarget }
      : {}),
    ...(frequencyType ===
    "specific_days"
      ? { days: selectedDays }
      : {}),
  },
  reminder: {
    enabled: reminderEnabled,
    time: reminderEnabled
      ? reminderTime
      : null,
  },
  icon: icon || "🎯",
  category:
    category.trim() || "General",
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
            <label className="text-sm font-medium text-gray-700">
              Category
            </label>

            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Frequency
            </label>

            <select
              value={frequencyType}
              onChange={(event) => setFrequencyType(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
            >
              <option value="daily">Every day</option>
              <option value="weekly">Times per week</option>
              <option value="specific_days">Specific days</option>
            </select>

            {frequencyType === "weekly" && (
              <select
                value={weeklyTarget}
                onChange={(event) =>
                  setWeeklyTarget(Number(event.target.value))
                }
                className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((target) => (
                  <option key={target} value={target}>
                    {target} {target === 1 ? "time" : "times"} per week
                  </option>
                ))}
              </select>
            )}

            {frequencyType === "specific_days" && (
              <div className="mt-3 grid grid-cols-7 gap-2">
                {[
                  ["S", 0],
                  ["M", 1],
                  ["T", 2],
                  ["W", 3],
                  ["T", 4],
                  ["F", 5],
                  ["S", 6],
                ].map(([label, day]) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg py-2 text-sm font-medium ${selectedDays.includes(day) ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
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
