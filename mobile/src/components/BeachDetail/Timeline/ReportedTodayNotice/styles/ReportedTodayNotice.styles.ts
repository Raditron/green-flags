import { StyleSheet } from "react-native";
import { hexToRgba } from "../../../../../shared/styles/colorMix";
import { BORDER_RADIUS } from "../../../../../theme/tokens";
import type { ThemeTokens } from "../../../../../theme/tokens";

// RN port of frontend's ReportedTodayNotice/styles/ReportedTodayNotice.styles.ts. Mirrors
// UnguardedNotice's tint recipe (border/background as a hexToRgba wash over the accent, rather
// than solid-filled like Verdict) but keyed to tokens.info instead of tokens.flagRed — same
// family, different accent, so the two never get confused for each other on screen.
export function getReportedTodayNoticeStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    panel: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      padding: 14,
      borderRadius: BORDER_RADIUS,
      borderWidth: 1,
      borderColor: hexToRgba(tokens.info, 45),
      backgroundColor: hexToRgba(tokens.info, 12),
    },
    icon: {
      marginTop: 2,
    },
    textCol: {
      flexDirection: "column",
      flex: 1,
      gap: 6,
    },
    headline: {
      fontSize: 14.5,
      fontWeight: "700",
      color: tokens.info,
      lineHeight: 18,
      textAlign: "center",
    },
    sentence: {
      fontSize: 13,
      color: tokens.text,
      opacity: 0.85,
      lineHeight: 18,
    },
  });
}
