import type { CSSProperties } from "react";

type LayoutStyleKey =
  | "page"
  | "header"
  | "left"
  | "title"
  | "dashboardLink"
  | "beachesLink"
  | "savedLink"
  | "greeting"
  | "right"
  | "signInButton"
  | "verifyBanner"
  | "resendButton"
  | "error"
  | "main";

// Shared pill treatment for the Dashboard/Beaches nav links: a button-style
// outline that's invisible at rest and a drop shadow that lifts in on
// hover/focus, so the header reads as clickable chips rather than plain text.
function navLinkStyle(isRaised: boolean, isFocused: boolean): CSSProperties {
  return {
    color: "var(--text)",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    padding: "6px 12px",
    borderRadius: 6,
    border: `1px solid ${isRaised ? "var(--text-h)" : "transparent"}`,
    outline: isFocused ? "2px solid var(--text-h)" : "2px solid transparent",
    outlineOffset: 2,
    boxShadow: isRaised ? "0 4px 10px rgba(0, 0, 0, 0.22)" : "none",
    transform: isRaised ? "translateY(-1px)" : "none",
    transition:
      "border-color 0.15s ease, transform 0.15s ease, outline-color 0.15s ease, box-shadow 0.15s ease",
  };
}

export function getLayoutStyles({
  isDashboardHovered = false,
  isDashboardFocused = false,
  isBeachesHovered = false,
  isBeachesFocused = false,
  isSavedHovered = false,
  isSavedFocused = false,
}: {
  isDashboardHovered?: boolean;
  isDashboardFocused?: boolean;
  isBeachesHovered?: boolean;
  isBeachesFocused?: boolean;
  isSavedHovered?: boolean;
  isSavedFocused?: boolean;
} = {}): Record<LayoutStyleKey, CSSProperties> {
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
    dashboardLink: navLinkStyle(
      isDashboardHovered || isDashboardFocused,
      isDashboardFocused,
    ),
    beachesLink: navLinkStyle(
      isBeachesHovered || isBeachesFocused,
      isBeachesFocused,
    ),
    savedLink: navLinkStyle(
      isSavedHovered || isSavedFocused,
      isSavedFocused,
    ),
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
