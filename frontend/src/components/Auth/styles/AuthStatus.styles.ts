import type { CSSProperties } from "react";

type AuthStatusStyleKey =
  | "bar"
  | "email"
  | "verifyBanner"
  | "signInButton"
  | "logOutButton"
  | "resendButton"
  | "error";

export function getAuthStatusStyles(): Record<AuthStatusStyleKey, CSSProperties> {
  const button: CSSProperties = {
    border: "1px solid var(--border)",
    borderRadius: 6,
    background: "var(--surface)",
    color: "var(--text)",
    padding: "6px 12px",
    font: "inherit",
    cursor: "pointer",
  };

  return {
    bar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 16,
      fontSize: 14,
    },
    email: {
      color: "var(--text-h)",
      fontWeight: 600,
    },
    verifyBanner: {
      color: "var(--flag-yellow)",
    },
    signInButton: button,
    logOutButton: button,
    resendButton: {
      ...button,
      padding: "2px 8px",
      fontSize: 13,
    },
    error: {
      color: "var(--error)",
    },
  };
}
