import type { CSSProperties } from "react";

type LayoutStyleKey =
  | "page"
  | "header"
  | "headerRowWide"
  | "headerRowTop"
  | "headerRowNav"
  | "titleBlock"
  | "navGroup"
  | "rightGroup"
  | "title"
  | "titleIcon"
  | "navIcon"
  | "greeting"
  | "signInButton"
  | "main";

export function getLayoutStyles(): Record<LayoutStyleKey, CSSProperties> {
  return {
    page: {
      minHeight: "100vh",
      background: "var(--bg)",
    },
    // Outer chrome shared by both the wide (one row) and compact (two stacked rows) layouts —
    // which row structure lands inside is decided in Layout.tsx by useIsCompactHeader, not by
    // this container wrapping on its own.
    header: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      padding: "12px 24px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
    },
    // Wide layout: title+greeting, nav pills, and right controls all as siblings in one row.
    headerRowWide: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "nowrap",
      gap: 12,
    },
    // Compact layout, row 1: title+greeting on the left, right controls on the right.
    headerRowTop: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    // Compact layout, row 2: the nav-pills group alone, full width.
    headerRowNav: {
      display: "flex",
    },
    titleBlock: {
      display: "flex",
      flexDirection: "column",
    },
    // The three (or two, signed-out) nav pills — nowrap in both layouts so they move between
    // rows as a single unit but can never split from each other internally.
    navGroup: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "nowrap",
    },
    rightGroup: {
      display: "flex",
      alignItems: "center",
      gap: 12,
    },
    title: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      color: "var(--flag-green)",
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      textDecoration: "none",
    },
    titleIcon: {
      width: 14,
      height: 14,
    },
    // Leading icon inside each nav pill — sized to match titleIcon so the pills and the
    // "Green Flags" title read as the same icon+label pattern. Color comes for free from the
    // pill's own `color` via the icon's default currentColor fill.
    navIcon: {
      width: 14,
      height: 14,
    },
    greeting: {
      color: "var(--text)",
      fontSize: 14,
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
