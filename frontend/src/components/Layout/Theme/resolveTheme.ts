export type Theme = "light" | "dark";

/**
 * "Explicit override wins, else system." Pure so it stays testable/decoupled
 * from the DOM and React — see ADR 0006.
 *
 * @param stored The visitor's explicit choice from localStorage, or `null`
 *   if they've never toggled.
 * @param prefersDark The OS-level `prefers-color-scheme: dark` match.
 */
export function resolveTheme(stored: Theme | null, prefersDark: boolean): Theme {
  if (stored) return stored;
  return prefersDark ? "dark" : "light";
}
