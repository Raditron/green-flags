import type { CSSProperties } from "react";

type EmailVerificationBannerStyleKey = "verifyBanner" | "resendButton" | "error";

export function getEmailVerificationBannerStyles(): Record<
  EmailVerificationBannerStyleKey,
  CSSProperties
> {
  return {
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
  };
}
