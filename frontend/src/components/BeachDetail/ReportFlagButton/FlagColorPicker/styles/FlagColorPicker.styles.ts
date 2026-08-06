import type { CSSProperties } from "react";
import { flagColorVar } from "../../../../../shared/styles/flagColor";

type FlagColorPickerStyleKey = "backdrop" | "picker" | "prompt" | "options" | "close";

export function getFlagColorPickerStyles(): Record<FlagColorPickerStyleKey, CSSProperties> {
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
      width: 320,
      maxWidth: "calc(100vw - 32px)",
      textAlign: "center",
    },
    prompt: {
      margin: "0 0 16px",
      color: "var(--text-h)",
      fontWeight: 600,
    },
    options: {
      display: "flex",
      gap: 12,
      justifyContent: "center",
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

export function getFlagColorOptionStyle(flagColor: string, submitting: boolean): CSSProperties {
  return {
    flex: 1,
    border: "none",
    borderRadius: 6,
    color: "#fff",
    padding: "14px 0",
    font: "inherit",
    fontWeight: 600,
    cursor: submitting ? "default" : "pointer",
    opacity: submitting ? 0.6 : 1,
    background: flagColorVar(flagColor),
  };
}
