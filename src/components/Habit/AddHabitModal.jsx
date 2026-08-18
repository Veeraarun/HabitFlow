import { useState } from "react";

function AddHabitModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [category, setCategory] = useState("");
  const [frequencyType, setFrequencyType] = useState("daily");
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const [reminderTime, setReminderTime] = useState("20:00");

  const [weeklyTarget, setWeeklyTarget] = useState(3);

  const [selectedDays, setSelectedDays] = useState([1, 3, 5]);

  const resetForm = () => {
    setName("");
    setIcon(String.fromCodePoint(0x1f3af));
    setCategory("");
    setFrequencyType("daily");
    setWeeklyTarget(3);
    setSelectedDays([1, 3, 5]);
    setReminderEnabled(false);
    setReminderTime("20:00");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const toggleDay = (day) => {
    setSelectedDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((item) => item !== day)
        : [...currentDays, day].sort(),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onAdd({
      name: trimmedName,
      icon,
      category: category.trim() || "General",

      frequency: {
        type: frequencyType,

        target: frequencyType === "weekly" ? weeklyTarget : undefined,

        days: frequencyType === "specific_days" ? selectedDays : undefined,
      },

      reminder: {
        enabled: reminderEnabled,
        time: reminderEnabled ? reminderTime : null,
      },
    });

resetForm();
onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-habit-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2
              id="add-habit-title"
              className="text-xl font-bold text-gray-900"
            >
              Add Habit
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add something you want to stay consistent with.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close add habit dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="add-habit-name"
              className="text-sm font-medium text-gray-700"
            >
              Habit name
            </label>

            <input
              type="text"
              id="add-habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read a book"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
              autoFocus
            />
          </div>

          {/* Icon */}
          <div>
            <label
              htmlFor="add-habit-icon"
              className="text-sm font-medium text-gray-700"
            >
              Icon
            </label>

            <input
              type="text"
              id="add-habit-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={2}
              className="mt-2 w-20 rounded-lg border border-gray-300 px-4 py-3 text-center text-xl outline-none focus:border-gray-900"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="add-habit-category"
              className="text-sm font-medium text-gray-700"
            >
              Category
            </label>

            <input
              type="text"
              id="add-habit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Health, Learning"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label
              id="add-habit-frequency"
              className="text-sm font-medium text-gray-700"
            >
              Frequency
            </label>

            <div className="mt-3 space-y-3">
              {/* Daily */}
              <button
                type="button"
                aria-pressed={frequencyType === "daily"}
                onClick={() => setFrequencyType("daily")}
                className={`w-full rounded-xl border p-3 text-left text-sm ${
                  frequencyType === "daily"
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                Every day
              </button>

              {/* Weekly */}
              <button
                type="button"
                aria-pressed={frequencyType === "weekly"}
                onClick={() => setFrequencyType("weekly")}
                className={`w-full rounded-xl border p-3 text-left text-sm ${
                  frequencyType === "weekly"
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                Times per week
              </button>

              {frequencyType === "weekly" && (
                <select
                  aria-label="Weekly target"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm"
                >
                  <option value={1}>1 time per week</option>
                  <option value={2}>2 times per week</option>
                  <option value={3}>3 times per week</option>
                  <option value={4}>4 times per week</option>
                  <option value={5}>5 times per week</option>
                  <option value={6}>6 times per week</option>
                  <option value={7}>7 times per week</option>
                </select>
              )}

              {/* Specific days */}
              <button
                type="button"
                aria-pressed={frequencyType === "specific_days"}
                onClick={() => setFrequencyType("specific_days")}
                className={`w-full rounded-xl border p-3 text-left text-sm ${
                  frequencyType === "specific_days"
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                Specific days
              </button>

              {frequencyType === "specific_days" && (
                <div className="grid grid-cols-7 gap-2">
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
                      aria-pressed={selectedDays.includes(day)}
                      onClick={() => toggleDay(day)}
                      className={`rounded-lg py-2 text-sm font-medium ${
                        selectedDays.includes(day)
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Reminder</p>

                <p className="mt-1 text-xs text-gray-500">
                  Get a reminder for this habit.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={reminderEnabled}
                aria-label="Enable habit reminder"
                onClick={() => setReminderEnabled((enabled) => !enabled)}
                className={`relative h-7 w-12 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                  reminderEnabled ? "bg-gray-900" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    reminderEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {reminderEnabled && (
              <div className="mt-3">
                <label
                  htmlFor="add-habit-reminder-time"
                  className="text-sm font-medium text-gray-700"
                >
                  Reminder time
                </label>

                <input
                  id="add-habit-reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(event) => setReminderTime(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddHabitModal;
