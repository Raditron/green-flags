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
      // Bounded against `backdrop`, which is `flex: 1` (a definite, full-screen height) — so this
      // percentage resolves to a real cap, unlike the old `list.maxHeight: "50%"` which was
      // undefined against this card's auto-sized height. Same convention as AreaSelect's `sheet`.
      maxHeight: "80%",
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
      // `flexShrink: 1` (RN's column-child default is 0) lets this ScrollView give up height to
      // stay within `picker`'s now-bounded card instead of forcing the card to grow past it. Once
      // the ScrollView has a real bounded frame, it scrolls and clips its own content internally,
      // so rows can no longer render past the card's opaque background.
      flexShrink: 1,
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
    // `position: absolute` lives on the *button* (the `Pressable` wrapping the "×"), not the glyph
    // itself: an absolutely-positioned child is sized/positioned against its immediate parent, so
    // putting it on the inner Text left it pinned to the unstyled Pressable wrapper instead — which
    // has no intrinsic size of its own (its only child is out of flow) and so sits wherever normal
    // flow places it, after the ScrollView. Anchoring the Pressable itself to `picker` (its direct,
    // implicitly-positioned parent) keeps the whole button fixed at the card's top-right corner
    // regardless of how tall the list renders.
    closeButton: {
      position: "absolute",
      top: 8,
      right: 12,
    },
    closeIcon: {
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
