export function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === "light") {
    root.classList.remove("dark");
    return;
  }

  if (theme === "dark") {
    root.classList.add("dark");
    return;
  }

  const prefersDark =
    window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

  root.classList.toggle(
    "dark",
    prefersDark,
  );
}