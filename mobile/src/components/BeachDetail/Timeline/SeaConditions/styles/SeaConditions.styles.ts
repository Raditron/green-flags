import { StyleSheet } from "react-native";
import { BORDER_RADIUS } from "../../../../../theme/tokens";
import type { ThemeTokens } from "../../../../../theme/tokens";

// Wind and sea each get their own card, stacked vertically inside one wrapper — `stack` is the
// single flex item Timeline's row sees (alongside the time and confidence cards); `panel` is
// applied to each of the two cards inside it. Mirrors frontend's SeaConditions.styles.ts.
export function getSeaConditionsStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    stack: {
      flex: 1,
      minWidth: 220,
      gap: 12,
    },
    panel: {
      flex: 1,
      padding: 12,
      borderRadius: BORDER_RADIUS,
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    icon: {
      marginTop: 2,
      color: tokens.text,
      opacity: 0.75,
    },
    textCol: {
      flexDirection: "column",
      flexShrink: 1,
    },
    label: {
      fontSize: 13.5,
      fontWeight: "600",
      color: tokens.textHeading,
      textTransform: "capitalize",
    },
    caption: {
      fontSize: 12.5,
      color: tokens.text,
      opacity: 0.75,
    },
  });
}
