import type { CSSProperties } from "react";
import { flagColorVar } from "../../../../shared/styles/flagColor";
import type { FlagColor } from "../../interfaces";

type SeaSummaryCardStyleKey =
  | "card"
  | "hero"
  | "heroIcon"
  | "heroText"
  | "subtitle"
  | "headline"
  | "sentence"
  | "stormBanner"
  | "stormIcon"
  | "distributions"
  | "stats"
  | "statRow"
  | "statIcon"
  | "footer"
  | "footerLowSample";

export function getSeaSummaryCardStyles({
  flagColor,
}: {
  flagColor: FlagColor;
}): Record<SeaSummaryCardStyleKey, CSSProperties> {
  return {
    card: {
      margin: "0 auto",
      maxWidth: 1100,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      padding: 20,
      borderRadius: 12,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      textAlign: "left",
    },
    // Colored like Verdict's panel — this is the one thing a visitor reads before
    // anything else on the page, so it gets the same flag-color treatment.
    hero: {
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      padding: "16px 18px",
      borderRadius: 12,
      background: flagColorVar(flagColor),
      color: "#fff",
    },
    heroIcon: {
      flexShrink: 0,
      width: 26,
      height: 26,
      marginTop: 3,
      opacity: 0.9,
    },
    heroText: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      minWidth: 0,
    },
    subtitle: {
      fontSize: 13,
      opacity: 0.85,
    },
    headline: {
      fontSize: 24,
      fontWeight: 800,
      letterSpacing: "-0.01em",
    },
    sentence: {
      fontSize: 15,
      opacity: 0.92,
    },
    stormBanner: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 14px",
      borderRadius: 12,
      background: "color-mix(in srgb, var(--flag-red) 16%, transparent)",
      border: "1px solid color-mix(in srgb, var(--flag-red) 45%, transparent)",
      color: "var(--flag-red)",
      fontWeight: 700,
      fontSize: 13.5,
    },
    stormIcon: {
      flexShrink: 0,
      width: 16,
      height: 16,
    },
    distributions: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    stats: {
      display: "flex",
      flexWrap: "wrap",
      gap: 16,
    },
    statRow: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 13.5,
      color: "var(--text)",
    },
    statIcon: {
      flexShrink: 0,
      opacity: 0.75,
    },
    footer: {
      margin: 0,
      fontSize: 12.5,
      color: "var(--text)",
      opacity: 0.75,
    },
    footerLowSample: {
      margin: 0,
      fontSize: 12.5,
      color: "var(--text)",
      fontStyle: "italic",
    },
  };
}
