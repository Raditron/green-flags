import { StyleSheet } from "react-native";
import type { ThemeTokens } from "../../../../theme/tokens";

// RN port of frontend's DayOutlook.styles.ts.
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
    detailRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      alignItems: "stretch",
    },
  });
}
