import type { CSSProperties } from "react";

type SystemStatusStyleKey = "card" | "title" | "error" | "details" | "detailsTerm" | "detailsDescription";

export function getSystemStatusStyles(): Record<SystemStatusStyleKey, CSSProperties> {
  return {
    card: {
      border: "1px solid var(--border)",
      borderRadius: 8,
      background: "var(--surface)",
      padding: "20px 24px",
      textAlign: "left",
      maxWidth: 420,
      margin: "24px auto 0",
    },
    title: {
      margin: "0 0 12px",
      fontSize: 16,
    },
    error: {
      color: "#b91c1c",
    },
    details: {
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: "6px 16px",
      margin: 0,
    },
    detailsTerm: {
      fontWeight: 600,
      color: "var(--text-h)",
    },
    detailsDescription: {
      margin: 0,
    },
  };
}
