import type { CSSProperties } from "react";

type SeaConditionsStyleKey = "panel" | "row" | "icon" | "textCol" | "label" | "caption";

export function getSeaConditionsStyles(): Record<SeaConditionsStyleKey, CSSProperties> {
  return {
    panel: {
      flex: "1 1 0%",
      minWidth: 0,
      padding: "12px 16px",
      borderRadius: 8,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 10,
    },
    row: {
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
    },
    icon: {
      flexShrink: 0,
      marginTop: 2,
      color: "var(--text)",
      opacity: 0.75,
    },
    textCol: {
      display: "flex",
      flexDirection: "column",
    },
    label: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--text-h)",
      textTransform: "capitalize",
    },
    caption: {
      fontSize: 12.5,
      color: "var(--text)",
      opacity: 0.75,
    },
  };
}
