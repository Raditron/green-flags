import { StyleSheet } from "react-native";
import { BORDER_RADIUS } from "../../../theme/tokens";
import type { ThemeTokens } from "../../../theme/tokens";

/**
 * Mirrors frontend's `styles/X.styles.ts` convention (a `getXStyles(tokens)` function returning a
 * style-object map) — see `frontend/CONVENTIONS.md`. Re-derived on every render from the current
 * theme's tokens so the placeholder recolors live when the theme toggle flips.
 */
export function getBeachListStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: tokens.bg,
    },
    item: {
      padding: 16,
      borderRadius: BORDER_RADIUS,
      borderWidth: 1,
      borderColor: tokens.border,
      backgroundColor: tokens.surface,
    },
    itemText: {
      fontSize: 16,
      color: tokens.text,
    },
  });
}
