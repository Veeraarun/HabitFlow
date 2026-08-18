import { useState } from "react";

function HabitCard({
  icon,
  name,
  category,
  frequencyLabel,
  completed,
  onToggle,
  onEdit,
  onArchive,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const completionLabel = completed ? `Mark ${name} as incomplete` : `Mark ${name} as complete`;

  return (
    <div
      className={`relative flex items-center justify-between rounded-2xl border p-5 transition ${
        completed
          ? "border-gray-200 bg-gray-50 text-gray-700"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={completionLabel}
        className="flex min-w-0 flex-1 items-center gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
      >
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${completed ? "bg-gray-200" : "bg-gray-100"}`}>
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className={`truncate font-semibold ${completed ? "text-gray-600" : "text-gray-900"}`}>
            {name}
          </h3>
          <p className="mt-1 truncate text-sm text-gray-500">
            {category} · {frequencyLabel}
          </p>
        </div>
      </button>

      <div className="ml-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={completionLabel}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
            completed ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"
          }`}
        >
          {completed && "✓"}
        </button>

        <button
          type="button"
          onClick={() => setShowMenu((isOpen) => !isOpen)}
          aria-label={`Actions for ${name}`}
          aria-expanded={showMenu}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-gray-500 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          ⋮
        </button>

        {showMenu && (
          <div className="absolute right-5 top-14 z-20 w-32 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 text-sm shadow-lg">
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                onEdit();
              }}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                onArchive();
              }}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none"
            >
              Archive
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HabitCard;
