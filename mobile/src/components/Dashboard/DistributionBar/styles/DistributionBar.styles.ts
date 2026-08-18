import { StyleSheet } from "react-native";
import type { ThemeTokens } from "../../../../theme/tokens";

// RN port of frontend/src/components/Dashboard/DistributionBar/styles/DistributionBar.styles.ts.
// `track`/`segment` lose `overflow: "hidden"`'s rounded-corner clipping on web's flexbox row —
// RN's `overflow: "hidden"` on a `borderRadius`ed View clips its children the same way, so the
// segments still read as one pill-shaped bar.
export function getDistributionBarStyles(tokens: ThemeTokens, { compact }: { compact: boolean }) {
  return StyleSheet.create({
    wrap: {
      flexDirection: "column",
      gap: 4,
    },
    label: {
      fontSize: compact ? 11 : 12.5,
      fontWeight: "600",
      color: tokens.textHeading,
    },
    track: {
      flexDirection: "row",
      width: "100%",
      height: compact ? 6 : 10,
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: tokens.border,
    },
    segment: {
      height: "100%",
    },
    legend: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: compact ? 8 : 10,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    legendText: {
      fontSize: compact ? 10.5 : 12,
      color: tokens.text,
      opacity: 0.85,
    },
    legendDot: {
      width: compact ? 6 : 8,
      height: compact ? 6 : 8,
      borderRadius: 999,
    },
  });
}
