import { useCallback, useEffect, useState } from "react";

async function checkInternetConnection() {
  if (!navigator.onLine) {
    return false;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 5000);

  try {
    await fetch(
      "https://www.google.com/generate_204",
      {
        method: "GET",
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal,
      },
    );

    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    () => navigator.onLine,
  );

  const updateStatus = useCallback(async () => {
    const online =
      await checkInternetConnection();

    setIsOnline(online);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      updateStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener(
      "online",
      handleOnline,
    );

    window.addEventListener(
      "offline",
      handleOffline,
    );

    updateStatus();

    const interval = setInterval(
      updateStatus,
      15000,
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline,
      );

      window.removeEventListener(
        "offline",
        handleOffline,
      );

      clearInterval(interval);
    };
  }, [updateStatus]);

  return isOnline;
}