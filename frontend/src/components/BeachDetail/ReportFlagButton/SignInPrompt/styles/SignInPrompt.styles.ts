import type { CSSProperties } from "react";

type SignInPromptStyleKey = "message" | "action";

export function getSignInPromptStyles(): Record<SignInPromptStyleKey, CSSProperties> {
  return {
    message: {
      margin: "0 0 8px",
      color: "var(--text)",
    },
    action: {
      border: "none",
      borderRadius: 6,
      background: "var(--text-h)",
      color: "var(--bg)",
      padding: "6px 14px",
      font: "inherit",
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
    },
  };
}
