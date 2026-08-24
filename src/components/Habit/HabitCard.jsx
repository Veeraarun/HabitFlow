import { useState } from "react";

function HabitCard({
  icon,
  name,
  completed,
  streak = 0,
  reminderTime = null,
  disabled = false,
  onToggle,
  onDelete,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const completionLabel = completed ? `Mark ${name} as incomplete` : `Mark ${name} as complete`;

  return (
    <div
      className={`relative rounded-2xl border p-4 transition sm:p-5 ${
        disabled
          ? "border-gray-200 bg-gray-50"
          : completed
            ? "border-gray-200 bg-gray-50"
            : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={disabled ? undefined : onToggle}
          aria-label={completionLabel}
          aria-disabled={disabled}
          className={`flex min-w-0 flex-1 items-center gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${disabled ? "cursor-default" : ""}`}
        >
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${completed ? "bg-gray-200" : "bg-gray-100"}`}>
            {icon}
          </div>

          <div className="min-w-0">
            <h3 className={`truncate text-base font-semibold ${completed ? "text-gray-500 line-through" : "text-gray-900"}`}>
              {name}
            </h3>
            <div className="mt-0.5 flex items-center gap-2 text-sm text-gray-500">
              {streak > 0 && (
                <span className="flex items-center gap-0.5">
                  <span aria-hidden="true">🔥</span>
                  {streak}
                </span>
              )}
              {reminderTime && (
                <span>
                  {streak > 0 && " · "}
                  ⏰ {reminderTime}
                </span>
              )}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowMenu((isOpen) => !isOpen)}
          aria-label={`Actions for ${name}`}
          aria-expanded={showMenu}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          ⋮
        </button>

        <button
          type="button"
          onClick={disabled ? undefined : onToggle}
          aria-label={completionLabel}
          aria-disabled={disabled}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
            disabled
              ? "border-gray-200 text-transparent"
              : completed
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 text-transparent hover:border-gray-400"
          }`}
        >
          ✓
        </button>
      </div>

      {showMenu && (
        <div className="absolute right-4 top-[4.25rem] z-20 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 text-sm shadow-lg">
          {!isConfirmingDelete ? (
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                setIsConfirmingDelete(true);
              }}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none"
            >
              Delete
            </button>
          ) : (
            <div className="px-4 py-3">
              <p className="font-medium text-gray-900">
                Delete this habit?
              </p>
              <p className="mt-1 text-xs text-gray-500">
                This will permanently remove the habit and all its history.
              </p>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setIsConfirmingDelete(false);
                    onDelete();
                  }}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HabitCard;
