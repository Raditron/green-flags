import { StyleSheet } from "react-native";
import { hexToRgba } from "../../../../../shared/styles/colorMix";
import { BORDER_RADIUS } from "../../../../../theme/tokens";
import type { ThemeTokens } from "../../../../../theme/tokens";

// RN port of frontend's WorstAroundNotice.styles.ts. Same tint recipe as UnguardedNotice —
// color-mix wash over an accent rather than solid-filled — keyed to `info` like frontend's
// ReportedTodayNotice since this, too, is explanatory rather than a warning. Single-line variant
// of that panel shape: no separate headline, just an icon and the one sentence this notice exists
// to say.
export function getWorstAroundNoticeStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    panel: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: BORDER_RADIUS,
      borderWidth: 1,
      borderColor: hexToRgba(tokens.info, 45),
      backgroundColor: hexToRgba(tokens.info, 12),
    },
    sentence: {
      fontSize: 13,
      color: tokens.text,
      opacity: 0.85,
      lineHeight: 18,
    },
  });
}
