import { useEffect, useState } from "react";
import Today from "./pages/Today";
import Weekly from "./pages/Weekly";
import Monthly from "./pages/Monthly";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { HabitsProvider } from "./context/HabitsProvider";
import { AuthProvider } from "./context/AuthProvider";
import {
  startReminderScheduler,
  stopReminderScheduler,
} from "./services/reminders";

function App() {
  const [activePage, setActivePage] = useState("Today");
  const [addHabitRequest, setAddHabitRequest] = useState(0);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    startReminderScheduler();

    return () => {
      stopReminderScheduler();
    };
  }, []);

  const navigation = [
    { name: "Today", icon: "🏠" },
    { name: "Weekly", icon: "📅" },
    { name: "Monthly", icon: "📆" },
    { name: "Statistics", icon: "📊" },
    { name: "Settings", icon: "⚙️" },
  ];

  return (
    <AuthProvider>
      <HabitsProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-gray-200 bg-white p-6 md:block">
        <div className="mb-10">
          <h1 className="text-2xl font-bold">HabitFlow</h1>

          <p className="mt-1 text-sm text-gray-500">Build better days.</p>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => (
            <button
              type="button"
              key={item.name}
              onClick={() => setActivePage(item.name)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                activePage === item.name
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => {
            setActivePage("Today");
            setAddHabitRequest((request) => request + 1);
          }}
          className="mt-10 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium transition hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          + Add Habit
        </button>
      </aside>

      {/* Main */}
      <main className="min-h-screen md:ml-64">
        {/* Top Bar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 md:h-16 md:px-8">
          <span className="shrink-0 text-base font-bold tracking-tight">
            HabitFlow
          </span>

          <h2 className="truncate text-sm font-medium text-gray-500">
            {activePage}
          </h2>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isOnline
                  ? "bg-gray-100 text-gray-500"
                  : "bg-gray-900 text-white"
              }`}
              role="status"
              aria-live="polite"
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </header>

        {/* Mobile Navigation */}
        <nav className="border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {navigation.map((item) => (
              <button
                type="button"
                key={item.name}
                onClick={() => setActivePage(item.name)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                  activePage === item.name
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Page Content */}
        <section className="p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {activePage === "Today" && (
              <Today openAddRequest={addHabitRequest} />
            )}

            {activePage === "Weekly" && <Weekly />}

            {activePage === "Monthly" && <Monthly />}

            {activePage === "Statistics" && <Statistics />}

            {activePage === "Settings" && <Settings />}
          </div>
        </section>
      </main>
      </div>
      </HabitsProvider>
    </AuthProvider>
  );
}

export default App;
