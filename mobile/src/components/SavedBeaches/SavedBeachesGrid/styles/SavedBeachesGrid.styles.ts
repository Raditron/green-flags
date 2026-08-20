import { StyleSheet } from "react-native";
import type { ThemeTokens } from "../../../../theme/tokens";

/**
 * Unlike frontend's getSavedBeachesGridStyles (a straight re-export of BeachList's own styles —
 * see its own comment), mobile's grid needs one style of its own: `item`/`unsaveButton` position
 * the unsave star as a corner overlay on top of each BeachListCard (see SavedBeachesGrid.tsx) —
 * BeachList.tsx has no equivalent since #96's BeachListCard has no star at all. Everything else
 * (empty state, list padding/separator) reuses BeachList's own treatment via its `getBeachListStyles`.
 */
export function getSavedBeachesGridStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    item: {
      position: "relative",
    },
    // Top-right corner, matching frontend's confidence badge/list-card corner conventions —
    // rendered as a sibling *after* BeachListCard in the tree (not nested inside its Pressable),
    // so it paints on top and claims its own touches without fighting the card's onPress.
    unsaveButton: {
      position: "absolute",
      top: 4,
      right: 4,
      borderRadius: 999,
      backgroundColor: tokens.surface,
    },
  });
}
