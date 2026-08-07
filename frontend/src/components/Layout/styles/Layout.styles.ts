import type { CSSProperties } from "react";

type LayoutStyleKey =
  | "page"
  | "header"
  | "left"
  | "title"
  | "greeting"
  | "right"
  | "signInButton"
  | "verifyBanner"
  | "resendButton"
  | "error"
  | "main";

export function getLayoutStyles(): Record<LayoutStyleKey, CSSProperties> {
  return {
    page: {
      minHeight: "100vh",
      background: "var(--bg)",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      padding: "12px 24px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
    },
    left: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    },
    title: {
      color: "var(--text-h)",
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: "-0.01em",
      textDecoration: "none",
    },
    greeting: {
      color: "var(--text)",
      fontSize: 14,
    },
    right: {
      display: "flex",
      alignItems: "center",
    },
    signInButton: {
      border: "1px solid var(--border)",
      borderRadius: 6,
      background: "var(--surface)",
      color: "var(--text)",
      padding: "6px 12px",
      font: "inherit",
      cursor: "pointer",
    },
    verifyBanner: {
      textAlign: "center",
      color: "var(--flag-yellow)",
      fontSize: 14,
      padding: "8px 24px",
      borderBottom: "1px solid var(--border)",
    },
    resendButton: {
      border: "1px solid var(--border)",
      borderRadius: 6,
      background: "var(--surface)",
      color: "var(--text)",
      padding: "2px 8px",
      // `font` (shorthand) before `fontSize` so the explicit size below isn't reset by it.
      font: "inherit",
      fontSize: 13,
      cursor: "pointer",
    },
    error: {
      color: "var(--error)",
    },
    main: {
      margin: "0 auto",
      padding: "24px 24px 48px",
      textAlign: "center",
    },
  };
}
