import { StyleSheet } from "react-native";
import { flagColorFor } from "../../../../shared/styles/flagColor";
import { BORDER_RADIUS } from "../../../../theme/tokens";
import type { ThemeTokens } from "../../../../theme/tokens";
import type { FlagColor } from "../../../../shared/types/Beach";

// Mirrors AreaCard.styles.ts's shape: a flagColorFor-derived accent color threaded through both
// the flag glyph and the status line, everything else themed off `tokens`. `flagVar` comes back
// alongside `styles` so BeachListCard.tsx can reuse it for the flag glyph's color prop instead of
// calling flagColorFor a second time for the same input.
export function getBeachListCardStyles(
  tokens: ThemeTokens,
  { flagColor }: { flagColor: FlagColor | undefined },
) {
  const flagVar = flagColorFor(flagColor, tokens);

  const styles = StyleSheet.create({
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
    // Nudges the FontAwesome6 flag icon (size/color passed as props — see BeachListCard.tsx) down
    // to align with headerText's first line, same as before the Fa6 migration.
    flagIcon: {
      marginTop: 3,
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
    // Bottom-right corner (top-right is confidenceBadge's territory) — the same pill treatment
    // SavedBeachesGrid.tsx used to layer on top of this card as a sibling before the star moved
    // in here for #100; now a plain nested child works fine since it's a Pressable of its own and
    // claims its own taps without fighting `card`'s onPress. `right`/`bottom` match `card`'s own
    // `padding` (14) rather than an arbitrary small inset — confidenceBadge sits in normal flow
    // inset by that same padding, so this keeps both corner pills flush to the same edge.
    saveButton: {
      position: "absolute",
      bottom: 14,
      right: 14,
      borderRadius: 999,
      backgroundColor: tokens.bg,
      borderWidth: 1,
      borderColor: tokens.border,
    },
  });

  return { styles, flagVar };
}
