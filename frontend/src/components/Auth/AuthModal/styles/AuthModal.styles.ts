import type { CSSProperties } from "react";

type AuthModalStyleKey =
  | "backdrop"
  | "modal"
  | "title"
  | "form"
  | "label"
  | "input"
  | "submit"
  | "toggle"
  | "error"
  | "close";

export function getAuthModalStyles({
  submitting,
}: {
  submitting: boolean;
}): Record<AuthModalStyleKey, CSSProperties> {
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
    modal: {
      position: "relative",
      background: "var(--bg)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: 24,
      width: 320,
      maxWidth: "calc(100vw - 32px)",
      textAlign: "left",
    },
    title: {
      margin: "0 0 16px",
      fontSize: 18,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    label: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      fontSize: 14,
      color: "var(--text-h)",
    },
    input: {
      border: "1px solid var(--border)",
      borderRadius: 6,
      padding: "8px 10px",
      font: "inherit",
      background: "var(--surface)",
      color: "var(--text)",
    },
    submit: {
      border: "none",
      borderRadius: 6,
      background: "var(--flag-green)",
      color: "white",
      padding: 10,
      font: "inherit",
      fontWeight: 600,
      cursor: submitting ? "default" : "pointer",
      marginTop: 4,
      opacity: submitting ? 0.6 : 1,
    },
    toggle: {
      display: "block",
      marginTop: 16,
      border: "none",
      background: "none",
      color: "var(--text)",
      textDecoration: "underline",
      font: "inherit",
      fontSize: 13,
      cursor: "pointer",
      padding: 0,
    },
    error: {
      color: "var(--error)",
      fontSize: 13,
      margin: 0,
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
