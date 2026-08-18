import { StyleSheet } from "react-native";
import { flagColorFor } from "../../../../shared/styles/flagColor";
import { hexToRgba } from "../../../../shared/styles/colorMix";
import { BORDER_RADIUS } from "../../../../theme/tokens";
import type { ThemeTokens } from "../../../../theme/tokens";
import type { FlagColor } from "../../interfaces";

// RN port of frontend/src/components/Dashboard/SeaSummaryCard/styles/SeaSummaryCard.styles.ts.
// Web's `maxWidth: 1100` + `margin: "0 auto"` centering is a wide-viewport concern with no RN
// equivalent (the whole screen is the "viewport"); Dashboard.styles.ts's scroll container applies
// the same maxWidth/centering one level up instead, so it's dropped here.
export function getSeaSummaryCardStyles(tokens: ThemeTokens, { flagColor }: { flagColor: FlagColor }) {
  const flagVar = flagColorFor(flagColor, tokens);

  return StyleSheet.create({
    card: {
      flexDirection: "column",
      gap: 16,
      padding: 20,
      borderRadius: BORDER_RADIUS,
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
    },
    // Colored like the flag itself — this is the one thing a visitor reads before anything else
    // on the page, so it gets the same flag-color treatment.
    hero: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
      padding: 16,
      borderRadius: BORDER_RADIUS,
      backgroundColor: flagVar,
    },
    heroIcon: {
      width: 26,
      marginTop: 3,
      fontSize: 22,
      lineHeight: 26,
      color: "#fff",
      opacity: 0.9,
    },
    heroText: {
      flexDirection: "column",
      gap: 4,
      flexShrink: 1,
    },
    subtitle: {
      fontSize: 13,
      color: "#fff",
      opacity: 0.85,
    },
    headline: {
      fontSize: 24,
      fontWeight: "800",
      letterSpacing: -0.2,
      color: "#fff",
    },
    sentence: {
      fontSize: 15,
      color: "#fff",
      opacity: 0.92,
    },
    stormBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 10,
      paddingHorizontal: 14,
      borderRadius: BORDER_RADIUS,
      backgroundColor: hexToRgba(tokens.flagRed, 16),
      borderWidth: 1,
      borderColor: hexToRgba(tokens.flagRed, 45),
    },
    stormIcon: {
      fontSize: 15,
      color: tokens.flagRed,
    },
    stormText: {
      color: tokens.flagRed,
      fontWeight: "700",
      fontSize: 13.5,
      flexShrink: 1,
    },
    distributions: {
      flexDirection: "column",
      gap: 12,
    },
    stats: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },
    statRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statIcon: {
      fontSize: 14,
      color: tokens.text,
      opacity: 0.75,
    },
    statText: {
      fontSize: 13.5,
      color: tokens.text,
    },
    footer: {
      fontSize: 12.5,
      color: tokens.text,
      opacity: 0.75,
    },
    footerLowSample: {
      fontSize: 12.5,
      color: tokens.text,
      fontStyle: "italic",
    },
  });
}
