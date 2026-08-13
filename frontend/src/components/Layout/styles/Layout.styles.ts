import type { CSSProperties } from "react";

type LayoutStyleKey =
  | "page"
  | "header"
  | "left"
  | "title"
  | "greeting"
  | "right"
  | "signInButton"
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
      gap: 12,
    },
    signInButton: {
      border: "1px solid var(--border)",
      borderRadius: 999,
      background: "var(--surface)",
      color: "var(--text)",
      padding: "6px 16px",
      font: "inherit",
      fontWeight: 700,
      cursor: "pointer",
    },
    main: {
      margin: "0 auto",
      padding: "24px 24px 48px",
      textAlign: "center",
    },
  };
}
