import type { CSSProperties } from "react";
import { flagColorVar } from "../../../../shared/styles/flagColor";
import { neutralHintTextStyle } from "../../../../shared/styles/neutralHint";

type BeachListFiltersStyleKey =
  | "container"
  | "searchWrapper"
  | "searchIcon"
  | "searchInput"
  | "flagRow"
  | "areaRow"
  | "areaSelect"
  | "areaHint";

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
    areaRow: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
    },
    areaSelect: {
      padding: "9px 12px",
      borderRadius: 10,
      border: "1px solid var(--border)",
      background: "var(--surface)",
      color: "var(--text-h)",
      font: "inherit",
      fontSize: 14,
      cursor: "pointer",
    },
    // Confirms the area was picked for the visitor rather than by them.
    areaHint: neutralHintTextStyle,
  };
}

// Unselected chips stay outlined in the flag's own color so the option
// reads at a glance; selecting one fills it, matching the filled treatment
// the flag-color picker uses when reporting. The chip shows the same flag
// glyph used in the report popup rather than a color name.
export function getFlagFilterChipStyle(flagColor: string, isSelected: boolean): CSSProperties {
  const color = flagColorVar(flagColor);

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    border: `1.5px solid ${color}`,
    borderRadius: 100,
    padding: 0,
    cursor: "pointer",
    background: isSelected ? color : "transparent",
    transition: "background 0.12s ease",
  };
}

export function getFlagFilterIconStyle(flagColor: string, isSelected: boolean): CSSProperties {
  return {
    width: 16,
    height: 16,
    color: isSelected ? "#fff" : flagColorVar(flagColor),
  };
}
