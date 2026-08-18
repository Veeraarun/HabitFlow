export function isNotificationSupported() {
  return (
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export function getNotificationPermission() {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error(
      "Failed to request notification permission:",
      error,
    );

    return "denied";
  }
}

export async function showNotification(
  title,
  options,
) {
  if (!isNotificationSupported()) {
    throw new Error(
      "Notifications are not supported in this browser.",
    );
  }

  if (Notification.permission !== "granted") {
    throw new Error(
      "Notification permission has not been granted.",
    );
  }

  const registration =
    await navigator.serviceWorker.ready;

  await registration.showNotification(
    title,
    {
      ...options,
      icon: options?.icon || "/pwa-192x192.png",
      badge: options?.badge || "/pwa-192x192.png",
    },
  );
}

export async function showTestNotification() {
  await showNotification("HabitFlow", {
    body: "Notifications are working! 🔔",
    tag: "habitflow-test",
  });
}
