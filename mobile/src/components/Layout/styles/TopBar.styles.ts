import { StyleSheet } from "react-native";
import type { ThemeTokens } from "../../../theme/tokens";

/**
 * Mirrors frontend's `styles/X.styles.ts` convention (a `getXStyles(tokens)` function returning a
 * style-object map) — see `frontend/CONVENTIONS.md`. Matches frontend's `Layout.styles.ts` `header`/
 * `headerRowTop`: a `surface`-colored, `border`-bottomed strip with `12px 24px` padding. `bar`'s
 * `paddingTop` is finished off by TopBar itself (`insets.top` added on top of the base 12), since
 * that piece is per-device rather than a fixed token.
 *
 * `titleBlock`/`title` match frontend's `title`/`titleIcon` (the wordmark link inside
 * `titleBlock`) — `flagGreen`, uppercase, bold, letter-spaced; the icon itself is a FontAwesome6
 * `flag` sized/colored via props (see TopBar.tsx), not a style entry here. `letterSpacing` is
 * frontend's `0.08em` resolved against `title`'s 16px font size (RN has no `em` unit). `rightGroup` matches frontend's
 * style of the same name — the row `AccountControl` and `ThemeToggle` now share so `bar`'s
 * `space-between` has exactly two children: the wordmark and this group.
 */
export function getTopBarStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    bar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingHorizontal: 24,
      paddingBottom: 12,
      backgroundColor: tokens.surface,
      borderBottomWidth: 1,
      borderBottomColor: tokens.border,
    },
    titleBlock: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    title: {
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 1.28,
      textTransform: "uppercase",
    },
    rightGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
  });
}
