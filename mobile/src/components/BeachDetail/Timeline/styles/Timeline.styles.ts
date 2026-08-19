import { StyleSheet } from "react-native";
import { flagColorFor } from "../../../../shared/styles/flagColor";
import { BORDER_RADIUS } from "../../../../theme/tokens";
import type { ThemeTokens } from "../../../../theme/tokens";
import type { FlagColor } from "../../interfaces";

// RN port of frontend's Timeline.styles.ts, minus `updatedAt` (see usePredictions' doc comment —
// mobile's #97 scope drops the SWR cache that field described) and `timeHovered`-driven styling
// (a hover concept frontend's mouse-driven web UI has and RN's touch-first Pressable doesn't).
export function getTimelineStyles(tokens: ThemeTokens, { desaturated, flagColor }: { desaturated: boolean; flagColor?: FlagColor }) {
  // Only tint the card once an hour is actually selected — with nothing selected yet (e.g.
  // outside the lifeguard window with no manual pick), flagColorFor's neutral fallback reads too
  // light for white text, so fall back to the theme's own surface.
  const hasFlagColor = Boolean(flagColor);
  const textColor = hasFlagColor ? "#fff" : tokens.textHeading;

  return StyleSheet.create({
    card: {
      flex: 1,
      minWidth: 160,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 20,
      paddingHorizontal: 16,
      borderRadius: BORDER_RADIUS,
      backgroundColor: hasFlagColor ? flagColorFor(flagColor, tokens) : tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
      opacity: desaturated ? 0.65 : 1,
    },
    liveClock: {
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      color: textColor,
      opacity: 0.85,
    },
    selectedTime: {
      fontSize: 36,
      fontWeight: "800",
      color: textColor,
      paddingVertical: 4,
      paddingHorizontal: 14,
      lineHeight: 40,
    },
  });
}
