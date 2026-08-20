import { StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";
import type { ThemeTokens } from "../../../../../theme/tokens";

export function getTimePickerStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      alignItems: "center",
      justifyContent: "center",
    },
    picker: {
      backgroundColor: tokens.bg,
      borderWidth: 1,
      borderColor: tokens.border,
      borderRadius: 8,
      padding: 24,
      width: 280,
      maxWidth: "90%",
    },
    prompt: {
      marginBottom: 16,
      color: tokens.textHeading,
      fontWeight: "600",
      textAlign: "center",
    },
    list: {
      maxHeight: "50%",
      gap: 4,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    hourLabel: {
      flex: 1,
      textAlign: "left",
      color: tokens.textHeading,
    },
    nowTag: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      color: tokens.textHeading,
      opacity: 0.7,
    },
    close: {
      position: "absolute",
      top: 8,
      right: 12,
      fontSize: 20,
      lineHeight: 22,
      color: tokens.text,
    },
  });
}

export function getTimePickerRowStyle(tokens: ThemeTokens, { selected }: { selected: boolean }): ViewStyle {
  return {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: selected ? tokens.border : "transparent",
  };
}
