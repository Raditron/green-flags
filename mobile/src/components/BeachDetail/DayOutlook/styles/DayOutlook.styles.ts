import { StyleSheet } from "react-native";
import { BORDER_RADIUS } from "../../../../theme/tokens";
import type { ThemeTokens } from "../../../../theme/tokens";

// RN port of frontend's DayOutlook.styles.ts, plus `detailColumn`/`seaConditionsRow` — the same
// phone-width split Timeline.styles.ts uses (see its `detailColumn` comment): SeaConditions gets
// its own full-width, bordered row below HourDetail's rather than joining a flex-wrap row that
// squeezes both its cards down to an unreadable sliver on narrow screens.
export function getDayOutlookStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    status: {
      fontSize: 14,
      color: tokens.text,
      opacity: 0.8,
    },
    error: {
      fontSize: 14,
      color: tokens.error,
    },
    meta: {
      fontSize: 13,
      color: tokens.text,
    },
    detailColumn: {
      flexDirection: "column",
      gap: 16,
    },
    topRow: {
      flexDirection: "row",
      gap: 10,
    },
    seaConditionsRow: {
      borderColor: tokens.border,
      borderRadius: BORDER_RADIUS,
    },
  });
}
