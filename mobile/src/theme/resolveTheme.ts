export type Theme = "light" | "dark";

/**
 * "Explicit override wins, else system." Pure so it stays testable/decoupled from React Native's
 * `useColorScheme` and `AsyncStorage` — mirrors frontend's `Theme/resolveTheme.ts` and ADR 0006's
 * precedence exactly.
 *
 * @param stored The visitor's explicit choice loaded from `AsyncStorage`, or `null` if they've
 *   never toggled (or the read hasn't resolved yet).
 * @param prefersDark The OS-level dark-mode preference (`useColorScheme() === "dark"`).
 */
export function resolveTheme(stored: Theme | null, prefersDark: boolean): Theme {
  if (stored) return stored;
  return prefersDark ? "dark" : "light";
}
