import { StyleSheet } from "react-native";
import { BORDER_RADIUS } from "../../../../../theme/tokens";
import type { ThemeTokens } from "../../../../../theme/tokens";

// RN port of frontend's ReportFlagPanel/styles/ReportFlagPanel.styles.ts. Own neutral surface
// card, sitting as a sibling below Verdict (rather than an inset "hole" cut into Verdict's solid
// flag-color panel) — see Timeline.tsx. Un-tinted since it no longer needs to read against a
// saturated background, just the page behind it.
export function getReportFlagPanelStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    panel: {
      padding: 16,
      paddingBottom: 18,
      borderRadius: BORDER_RADIUS,
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
    },
    error: {
      marginBottom: 12,
      color: tokens.error,
      fontSize: 13,
      textAlign: "center",
    },
  });
}
