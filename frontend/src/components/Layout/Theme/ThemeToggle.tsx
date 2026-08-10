import { useTheme } from "./ThemeContext";
import { getThemeToggleStyles } from "./styles/ThemeToggle.styles";

// Shows the icon of the theme a click would switch *to* — a sun (switch to
// light) while dark, a moon (switch to dark) while light — so the glyph
// always previews the action, not just the current state.
function SunIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth={2} />
      <path
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        d="M12 1.5v3M12 19.5v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1.5 12h3M19.5 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a.75.75 0 0 0-.98-.98A9.99 9.99 0 1 0 21.48 15.48a.75.75 0 0 0-.98-.98Z"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const styles = getThemeToggleStyles();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      style={styles.button}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={theme === "dark"}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
