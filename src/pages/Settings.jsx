import { useEffect, useState } from "react";

import {
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
  showTestNotification,
} from "../utils/notifications";

import {
  getSettings,
  saveSettings,
} from "../utils/settings";

import { applyTheme } from "../utils/theme";

function Settings() {
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  const [notificationError, setNotificationError] =
    useState("");

  const [theme, setTheme] = useState("system");
  const [graceDays, setGraceDays] = useState(1);

  useEffect(() => {
    const settings = getSettings();

    setTheme(settings.theme);
    setGraceDays(settings.graceDays);

    applyTheme(settings.theme);

    setNotificationPermission(
      getNotificationPermission(),
    );
  }, []);

  const handleThemeChange = (value) => {
    setTheme(value);

    applyTheme(value);

    saveSettings({
      theme: value,
      graceDays,
    });
  };

  const handleGraceDaysChange = (value) => {
    setGraceDays(value);

    saveSettings({
      theme,
      graceDays: value,
    });
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Customize your experience
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
          Settings
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage how HabitFlow works for you.
        </p>
      </div>

      {/* Appearance */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Appearance
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Choose how HabitFlow looks.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              value: "light",
              label: "☀️ Light",
            },
            {
              value: "dark",
              label: "🌙 Dark",
            },
            {
              value: "system",
              label: "⚙️ System",
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                handleThemeChange(
                  option.value,
                )
              }
              className={`flex items-center justify-center rounded-xl border p-4 text-center text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                theme === option.value
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Notifications
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Receive reminders for your habits.
          </p>
        </div>

        {!isNotificationSupported() ? (
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">
              Notifications unavailable
            </p>

            <p className="mt-1 text-sm text-gray-500">
              This browser or app environment does
              not support HabitFlow notifications.
            </p>
          </div>
        ) : notificationPermission ===
          "granted" ? (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">
                  Notifications enabled
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  HabitFlow can now send reminder
                  notifications.
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Enabled
              </span>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={async () => {
                  setNotificationError("");

                  try {
                    await showTestNotification();
                  } catch (error) {
                    setNotificationError(
                      error instanceof Error
                        ? error.message
                        : "Failed to send test notification.",
                    );
                  }
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                Send test notification
              </button>
            </div>
          </div>
        ) : notificationPermission ===
          "denied" ? (
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">
              Notifications are blocked
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Enable notifications for HabitFlow
              in your browser or app settings.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <button
              type="button"
              onClick={async () => {
                setNotificationError("");

                const permission =
                  await requestNotificationPermission();

                setNotificationPermission(
                  permission,
                );
              }}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Enable notifications
            </button>

            <p className="mt-3 text-xs text-gray-500">
              Your browser will ask for permission.
            </p>
          </div>
        )}

        {notificationError && (
          <p
            className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
            role="alert"
          >
            {notificationError}
          </p>
        )}
      </section>

      {/* Habit Behavior */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Habit Behavior
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Configure how streaks handle missed days.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-gray-900">
              Grace days
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Missed days that won't immediately break
              your streak.
            </p>
          </div>

          <select
            value={graceDays}
            onChange={(e) =>
              handleGraceDaysChange(
                Number(e.target.value),
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 outline-none focus:border-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <option value={0}>
              0 days
            </option>
            <option value={1}>
              1 day
            </option>
          </select>
        </div>
      </section>

      {/* Data */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Data
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage your habit data.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            Export Data
          </button>

          <button
            type="button"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            Import Data
          </button>
        </div>
      </section>

    </div>
  );
}

export default Settings;