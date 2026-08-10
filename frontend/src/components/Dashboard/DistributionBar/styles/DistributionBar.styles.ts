import type { CSSProperties } from "react";

type DistributionBarStyleKey = "wrap" | "label" | "track" | "segment" | "legend" | "legendItem" | "legendDot";

export function getDistributionBarStyles({ compact }: { compact: boolean }): Record<DistributionBarStyleKey, CSSProperties> {
  return {
    wrap: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
    },
    label: {
      fontSize: compact ? 11 : 12.5,
      fontWeight: 600,
      color: "var(--text-h)",
    },
    track: {
      display: "flex",
      width: "100%",
      height: compact ? 6 : 10,
      borderRadius: 999,
      overflow: "hidden",
      background: "var(--border)",
    },
    segment: {
      height: "100%",
      // Widths change when a fresh summary lands; a short transition reads as an update
      // rather than a jump-cut, same length as Verdict's own flag-color transition.
      transition: "width 0.2s ease",
    },
    legend: {
      display: "flex",
      flexWrap: "wrap",
      gap: compact ? 8 : 10,
    },
    legendItem: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: compact ? 10.5 : 12,
      color: "var(--text)",
      opacity: 0.85,
    },
    legendDot: {
      width: compact ? 6 : 8,
      height: compact ? 6 : 8,
      borderRadius: "50%",
      flexShrink: 0,
    },
  };
}
