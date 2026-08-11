import type { CSSProperties } from "react";

type AreaSelectStyleKey = "container" | "trigger" | "chevron" | "menu";

export function getAreaSelectStyles(): Record<AreaSelectStyleKey, CSSProperties> {
  return {
    container: {
      position: "relative",
    },
    trigger: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "9px 12px",
      borderRadius: 999,
      border: "1px solid var(--border)",
      background: "var(--surface)",
      color: "var(--text)",
      font: "inherit",
      fontSize: 14,
      cursor: "pointer",
    },
    chevron: {
      width: 10,
      height: 10,
      color: "var(--text)",
    },
    // Radius matches BeachListCard's outer panel so the two rounded surfaces in the list read
    // consistently. No max-height/scroll — the list is short enough (13 areas + All) to just
    // stretch and show everything at once, so it never needs its own scrollbar.
    menu: {
      position: "absolute",
      top: "calc(100% + 6px)",
      left: 0,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.18)",
      minWidth: 180,
      overflow: "hidden",
      zIndex: 20,
      margin: 0,
      padding: 6,
      listStyle: "none",
    },
  };
}

// Selected row highlight matches TimePicker's row convention (var(--border) fill, transparent
// otherwise). Hovering previews that same fill — same idea as SaveBeachButton's `active = saved ||
// isHovered` — so the row you're about to click shows itself as "this is what selecting it looks
// like" rather than a separate hover color.
export function getAreaSelectOptionStyle({
  selected,
  hovered,
  position,
}: {
  selected: boolean;
  hovered: boolean;
  position: "first" | "middle" | "last";
}): CSSProperties {
  // Only the corners that actually sit against the menu's rounded edge need to widen to match it
  // (menu's 16px radius minus its 6px padding = 10px) — the top row's top corners, the bottom
  // row's bottom corners — otherwise a hovered/selected fill square-cuts past the menu's curve.
  // Corners that don't touch an edge keep the smaller radius the rest of the app's row-pickers use.
  const borderRadius =
    position === "first" ? "10px 10px 6px 6px" : position === "last" ? "6px 6px 10px 10px" : 6;

  return {
    width: "100%",
    display: "block",
    textAlign: "left",
    border: "none",
    borderRadius,
    padding: "9px 12px",
    font: "inherit",
    fontSize: 14,
    color: "var(--text-h)",
    cursor: "pointer",
    background: selected || hovered ? "var(--border)" : "transparent",
    transition: "background 0.12s ease",
  };
}
