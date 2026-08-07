import type { CSSProperties } from "react";

type TimePickerStyleKey = "backdrop" | "picker" | "prompt" | "list" | "dot" | "hourLabel" | "nowTag" | "close";

export function getTimePickerStyles(): Record<TimePickerStyleKey, CSSProperties> {
  return {
    backdrop: {
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    picker: {
      position: "relative",
      background: "var(--bg)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: 24,
      width: 280,
      maxWidth: "calc(100vw - 32px)",
      textAlign: "center",
    },
    prompt: {
      margin: "0 0 16px",
      color: "var(--text-h)",
      fontWeight: 600,
    },
    list: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: 4,
      maxHeight: "50vh",
      overflowY: "auto",
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      flexShrink: 0,
    },
    hourLabel: {
      flex: 1,
      textAlign: "left",
    },
    nowTag: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      opacity: 0.7,
    },
    close: {
      position: "absolute",
      top: 8,
      right: 12,
      border: "none",
      background: "none",
      fontSize: 20,
      lineHeight: 1,
      cursor: "pointer",
      color: "var(--text)",
    },
  };
}

export function getTimePickerRowStyle({ selected }: { selected: boolean }): CSSProperties {
  return {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "none",
    borderRadius: 6,
    padding: "8px 10px",
    font: "inherit",
    fontSize: 14,
    color: "var(--text-h)",
    cursor: "pointer",
    background: selected ? "var(--border)" : "transparent",
  };
}
