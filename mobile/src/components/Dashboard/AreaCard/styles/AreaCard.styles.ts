import { StyleSheet } from "react-native";
import { hexToRgba } from "../../../../shared/styles/colorMix";
import { flagColorFor } from "../../../../shared/styles/flagColor";
import { BORDER_RADIUS } from "../../../../theme/tokens";
import type { ThemeTokens } from "../../../../theme/tokens";
import type { FlagColor } from "../../interfaces";

// RN port of frontend/src/components/Dashboard/AreaCard/styles/AreaCard.styles.ts. Card width
// itself is driven by DashboardSummary's flex-wrap grid, not this file (see its styles).
export function getAreaCardStyles(tokens: ThemeTokens, { flagColor }: { flagColor: FlagColor }) {
  const flagVar = flagColorFor(flagColor, tokens);

  return StyleSheet.create({
    card: {
      flexDirection: "column",
      gap: 10,
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
    areaName: {
      fontSize: 15,
      fontWeight: "700",
      color: tokens.textHeading,
    },
    headline: {
      fontSize: 12.5,
      fontWeight: "600",
      color: flagVar,
    },
    // Compact badge, not a full banner — a grid with several Areas active at once needs to
    // stay scannable rather than every card sprouting its own full-width alert strip. Frontend
    // wraps this in a Tooltip on hover; RN has no hover, so the same "storm warning active for
    // N% of today's readings" text that tooltip would show goes straight into this badge's
    // `accessibilityLabel` instead (see AreaCard.tsx).
    stormBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 999,
      backgroundColor: hexToRgba(tokens.flagRed, 16),
    },
    stormBadgeIcon: {
      fontSize: 11,
      color: tokens.flagRed,
    },
    stormBadgeText: {
      color: tokens.flagRed,
      fontSize: 11,
      fontWeight: "700",
    },
    sentence: {
      fontSize: 12.5,
      color: tokens.text,
      opacity: 0.85,
    },
    distributions: {
      flexDirection: "column",
      gap: 8,
    },
    stats: {
      flexDirection: "column",
      gap: 2,
    },
    statText: {
      fontSize: 12,
      color: tokens.text,
    },
    footer: {
      fontSize: 11,
      color: tokens.text,
      opacity: 0.75,
    },
    footerLowSample: {
      fontSize: 11,
      color: tokens.text,
      fontStyle: "italic",
    },
  });
}
