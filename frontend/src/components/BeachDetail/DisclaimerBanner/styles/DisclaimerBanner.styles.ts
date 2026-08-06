import type { CSSProperties } from "react";

export function getDisclaimerBannerStyles(): Record<"banner", CSSProperties> {
  return {
    banner: {
      margin: "16px 0 0",
      padding: "10px 12px",
      borderRadius: 8,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      fontSize: 13,
      color: "var(--text)",
    },
  };
}
