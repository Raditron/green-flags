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
    // Time card + HourDetail's confidence ring stay side by side (both roughly square, both
    // sized for a narrow phone width); SeaConditions goes on its own full-width row below rather
    // than joining that row's flex-wrap, since on phone widths the old three-way row wrapped it
    // in a way that squeezed both its cards down to an unreadable sliver. See DayOutlook.styles.ts'
    // `detailColumn`/`seaConditionsRow` for the future-day counterpart of this same split.
    detailColumn: {
      flexDirection: "column",
      gap: 16,
    },
    topRow: {
      flexDirection: "row",
      gap: 10,
    },
    // Its own bordered row (rather than leaving SeaConditions' own two card borders as the only
    // framing) so the block reads as one grouped unit at a glance, matching the time/ring row
    // above it.
    seaConditionsRow: {
      borderColor: tokens.border,
      borderRadius: BORDER_RADIUS,
    },
    card: {
      flex: 1,
      minWidth: 160,
      alignItems: "center",
      justifyContent: "flex-start",
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
    // Fills the card's remaining height below liveClock so selectedTime can center in that space
    // while liveClock itself stays pinned to the top.
    selectedTimeWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
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
