import { StyleSheet } from "react-native";
import type { ThemeTokens } from "../../../theme/tokens";

/**
 * Mirrors frontend's `styles/X.styles.ts` convention (a `getXStyles(tokens)` function returning a
 * style-object map) — see `frontend/CONVENTIONS.md`. Re-derived on every render from the current
 * theme's tokens so the placeholder recolors live when the theme toggle flips.
 */
export function getSavedBeachesStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: tokens.bg,
    },
    text: {
      fontSize: 16,
      color: tokens.text,
    },
  });
}
