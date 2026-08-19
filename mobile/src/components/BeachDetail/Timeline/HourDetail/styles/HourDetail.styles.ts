import { StyleSheet } from "react-native";
import { BORDER_RADIUS } from "../../../../../theme/tokens";
import type { ThemeTokens } from "../../../../../theme/tokens";

export function getHourDetailStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    panel: {
      flex: 1,
      minWidth: 160,
      padding: 14,
      borderRadius: BORDER_RADIUS,
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
      alignItems: "center",
      justifyContent: "center",
    },
    hour: {
      fontWeight: "600",
      color: tokens.textHeading,
    },
    ringWrap: {
      marginTop: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    percent: {
      position: "absolute",
      fontWeight: "700",
      fontSize: 16,
      color: tokens.textHeading,
    },
    caption: {
      marginTop: 8,
      fontSize: 12.5,
      color: tokens.text,
      opacity: 0.75,
      textAlign: "center",
    },
  });
}
