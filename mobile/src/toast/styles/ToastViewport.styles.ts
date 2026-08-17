import { StyleSheet } from "react-native";

// Mirrors frontend's Layout/Toast/styles/ToastViewport.styles.ts layout (centered stack pinned
// to the bottom of the screen). `bottomInset` accounts for the safe area / tab bar, which
// position: fixed + a bare pixel offset didn't have to on the web.
export function getToastViewportStyles(bottomInset: number) {
  return StyleSheet.create({
    viewport: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: bottomInset,
      alignItems: "center",
      gap: 8,
      zIndex: 1000,
    },
  });
}
