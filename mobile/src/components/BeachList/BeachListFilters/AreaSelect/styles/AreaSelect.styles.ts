import { StyleSheet } from "react-native";
import { BORDER_RADIUS } from "../../../../../theme/tokens";
import type { ThemeTokens } from "../../../../../theme/tokens";

// Modal-sheet picker in place of frontend's FieldSelect dropdown (no RN select/picker library is
// installed — see AuthScreen.tsx's Modal precedent this borrows the backdrop/card treatment from).
export function getAreaSelectStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: tokens.border,
      backgroundColor: tokens.surface,
    },
    triggerText: {
      fontSize: 14,
      fontWeight: "600",
      color: tokens.text,
    },
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(4, 10, 20, 0.6)",
      justifyContent: "flex-end",
    },
    sheet: {
      maxHeight: "70%",
      padding: 16,
      borderTopLeftRadius: BORDER_RADIUS,
      borderTopRightRadius: BORDER_RADIUS,
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
    },
    sheetTitle: {
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: tokens.text,
      opacity: 0.75,
      marginBottom: 8,
    },
    option: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: BORDER_RADIUS,
    },
    optionText: {
      fontSize: 15,
      color: tokens.text,
    },
    optionTextSelected: {
      fontSize: 15,
      fontWeight: "700",
      color: tokens.textHeading,
    },
  });
}
