import { StyleSheet } from "react-native";
import { flagColorFor } from "../../../../shared/styles/flagColor";
import { BORDER_RADIUS } from "../../../../theme/tokens";
import type { ThemeTokens } from "../../../../theme/tokens";
import type { FlagColor } from "../../../../shared/types/Beach";

// Mirrors AreaCard.styles.ts's shape: a flagColorFor-derived accent color threaded through both
// the flag glyph and the status line, everything else themed off `tokens`.
export function getBeachListCardStyles(
  tokens: ThemeTokens,
  { flagColor }: { flagColor: FlagColor | undefined },
) {
  const flagVar = flagColorFor(flagColor, tokens);

  return StyleSheet.create({
    card: {
      flexDirection: "column",
      gap: 6,
      padding: 14,
      borderRadius: BORDER_RADIUS,
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    flagIcon: {
      width: 16,
      marginTop: 3,
      fontSize: 14,
      lineHeight: 16,
      color: flagVar,
    },
    headerText: {
      flexDirection: "column",
      gap: 2,
      flexShrink: 1,
      flexGrow: 1,
    },
    name: {
      fontSize: 16,
      fontWeight: "700",
      color: tokens.textHeading,
    },
    area: {
      fontSize: 12.5,
      color: tokens.text,
      opacity: 0.8,
    },
    confidenceBadge: {
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 999,
      backgroundColor: tokens.bg,
      borderWidth: 1,
      borderColor: tokens.border,
    },
    confidenceText: {
      fontSize: 11,
      fontWeight: "700",
      color: tokens.text,
    },
    statusText: {
      fontSize: 13,
      fontWeight: "600",
      color: flagVar,
    },
    distanceText: {
      fontSize: 12,
      color: tokens.text,
      opacity: 0.75,
    },
  });
}
