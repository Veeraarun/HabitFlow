const SETTINGS_KEY = "habitflow-settings";

const DEFAULT_SETTINGS = {
  theme: "system",
  graceDays: 1,
};

export function getSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);

    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored);

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.error("Failed to load settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        ...DEFAULT_SETTINGS,
        ...settings,
      }),
    );
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}