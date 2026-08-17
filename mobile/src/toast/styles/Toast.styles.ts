import { StyleSheet } from "react-native";
import type { ThemeTokens } from "../../theme/tokens";

// Mirrors frontend's Layout/Toast/styles/Toast.styles.ts values exactly (pixel parity, per
// issue #91) — note borderRadius: 8 here is a deliberate exception to the general 12px default
// (frontend/CONVENTIONS.md), inherited unchanged from the component being ported.
export function getToastStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    toast: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      minWidth: 240,
      maxWidth: 600,
      padding: 12,
      borderRadius: 8,
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
      shadowColor: "#000",
      shadowOpacity: 0.24,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6, // Android's shadow equivalent — shadow* props above are iOS/web-only
    },
    content: {
      flex: 1,
    },
    contentText: {
      color: tokens.text,
      fontSize: 13,
    },
    close: {
      color: tokens.text,
      fontSize: 18,
      lineHeight: 18,
      opacity: 0.7,
    },
  });
}
