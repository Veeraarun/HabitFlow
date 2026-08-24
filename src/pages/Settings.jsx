import { useEffect, useState } from "react";

import {
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
  showTestNotification,
} from "../utils/notifications";
import { useAuth } from "../hooks/useAuth";

function Settings() {
  const {
    user,
    isLoading: isAuthLoading,
    authError,
    isSupabaseConfigured,
    signInWithGoogle,
    signOut,
  } = useAuth();

  const [notificationPermission, setNotificationPermission] =
    useState("default");

  const [notificationError, setNotificationError] =
    useState("");

  const [signInError, setSignInError] = useState("");

  useEffect(() => {
    setNotificationPermission(
      getNotificationPermission(),
    );
  }, []);

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

      {/* Account */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Account
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Sign in to sync your data across devices.
          </p>
        </div>

        {isAuthLoading ? (
          <div className="mt-6">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : user ? (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg font-medium text-gray-600">
                    {(user.user_metadata?.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {user.user_metadata?.name || "Signed in user"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Signed in
              </span>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : isSupabaseConfigured ? (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setSignInError("");
                signInWithGoogle();
              }}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">
              Cloud sign-in unavailable
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Cloud sign-in is not configured. You can still use HabitFlow locally.
            </p>
          </div>
        )}

        {(signInError || authError) && (
          <p
            className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
            role="alert"
          >
            {signInError || authError}
          </p>
        )}
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

    </div>
  );
}

export default Settings;
