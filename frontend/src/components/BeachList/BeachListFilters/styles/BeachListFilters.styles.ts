import type { CSSProperties } from "react";
import { flagColorVar } from "../../../../shared/styles/flagColor";

type BeachListFiltersStyleKey =
  | "container"
  | "searchWrapper"
  | "searchIcon"
  | "searchInput"
  | "flagRow";

export function getBeachListFiltersStyles(): Record<BeachListFiltersStyleKey, CSSProperties> {
  return {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      width: "100%",
      maxWidth: 900,
      margin: "0 auto",
    },
    searchWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    searchIcon: {
      position: "absolute",
      left: 14,
      width: 14,
      height: 14,
      color: "var(--text)",
      pointerEvents: "none",
    },
    searchInput: {
      width: "100%",
      padding: "10px 14px 10px 38px",
      borderRadius: 10,
      border: "1px solid var(--border)",
      background: "var(--surface)",
      color: "var(--text-h)",
      font: "inherit",
      fontSize: 14,
    },
    flagRow: {
      display: "flex",
      gap: 8,
    },
  };
}

// Unselected chips stay outlined in the flag's own color so the option
// reads at a glance; selecting one fills it, matching the filled treatment
// the flag-color picker uses when reporting.
export function getFlagFilterChipStyle(flagColor: string, isSelected: boolean): CSSProperties {
  const color = flagColorVar(flagColor);

  return {
    border: `1.5px solid ${color}`,
    borderRadius: 100,
    padding: "6px 14px",
    font: "inherit",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    color: isSelected ? "#fff" : color,
    background: isSelected ? color : "transparent",
    transition: "background 0.12s ease, color 0.12s ease",
  };
}
