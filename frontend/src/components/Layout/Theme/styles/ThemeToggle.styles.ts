import type { CSSProperties } from "react";

type ThemeToggleStyleKey = "button";

// Mirrors UserMenu's circular icon-chip treatment (same 36px chip, same
// --icon-chip colors) rather than the pill-link style used for the
// Dashboard/Beaches nav — it sits in the same header group as UserMenu, so
// it should read as a sibling control, not a nav link.
export function getThemeToggleStyles(): Record<ThemeToggleStyleKey, CSSProperties> {
  return {
    button: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      border: "none",
      background: "var(--icon-chip)",
      color: "var(--icon-chip-fg)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };
}
