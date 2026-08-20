import { StyleSheet } from "react-native";
import { hexToRgba } from "../../../../../shared/styles/colorMix";
import { BORDER_RADIUS } from "../../../../../theme/tokens";
import type { ThemeTokens } from "../../../../../theme/tokens";

// Sits directly under Verdict's flag-color panel. Deliberately tinted rather than solid-filled
// like Verdict — same panel shape and text hierarchy so it reads as "part of the same family",
// but the lighter treatment keeps it from being mistaken for an actual red-flag reading when both
// are on screen at once. Mirrors frontend's UnguardedNotice.styles.ts color-mix recipe via
// shared/styles/colorMix.ts's RN stand-ins.
export function getUnguardedNoticeStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    panel: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      padding: 14,
      borderRadius: BORDER_RADIUS,
      borderWidth: 1,
      borderColor: hexToRgba(tokens.flagRed, 45),
      backgroundColor: hexToRgba(tokens.flagRed, 12),
    },
    icon: {
      marginTop: 2,
    },
    textCol: {
      flexDirection: "column",
      flex: 1,
      gap: 6,
    },
    headline: {
      fontSize: 14.5,
      fontWeight: "700",
      color: tokens.flagRed,
      lineHeight: 18,
      textAlign: "center",
    },
    sentence: {
      fontSize: 13,
      color: tokens.text,
      opacity: 0.85,
      lineHeight: 18,
    },
  });
}
