import type { CSSProperties } from "react";

type UserMenuStyleKey = "container" | "chip" | "menu" | "menuItem";

export function getUserMenuStyles(): Record<UserMenuStyleKey, CSSProperties> {
  return {
    container: {
      position: "relative",
    },
    chip: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      border: "none",
      background: "var(--icon-chip)",
      color: "var(--icon-chip-fg)",
      // `font: inherit` first so the explicit size/weight below aren't reset by the
      // shorthand — buttons don't inherit font-family from the page by default, so this
      // order (shorthand base, then longhand overrides) matches the pattern used elsewhere.
      font: "inherit",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    menu: {
      position: "absolute",
      top: "calc(100% + 8px)",
      right: 0,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.18)",
      minWidth: 140,
      overflow: "hidden",
      zIndex: 20,
    },
    menuItem: {
      display: "block",
      width: "100%",
      border: "none",
      background: "none",
      color: "var(--text)",
      textAlign: "left",
      padding: "10px 14px",
      font: "inherit",
      fontSize: 14,
      cursor: "pointer",
    },
  };
}
