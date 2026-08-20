import { StyleSheet } from "react-native";
import { BORDER_RADIUS } from "../../../theme/tokens";
import type { ThemeTokens } from "../../../theme/tokens";

// RN port of frontend's BeachDetail.styles.ts. Drops `page`/`main`/`titleRow`/`back`/`backContainer`/
// `backIcon`/`title` — native-stack's own header (see RootNavigator.tsx) already supplies the back
// affordance and title, so there's no in-body title row to style the way frontend's web page needs
// one. `refreshing` is dropped along with usePredictions' cache (see its doc comment).
//
// `aspectRatio` is RN/Yoga-native (unlike most CSS layout, so no substitute needed here); frontend's
// `maxHeight: min(400px, 46vh)` has no RN viewport-unit equivalent, so this just caps at a fixed 400.
const IMAGE_ASPECT_RATIO = 12 / 5;
const IMAGE_MAX_HEIGHT = 400;

export function getBeachDetailStyles(tokens: ThemeTokens, insetBottom: number) {
  return StyleSheet.create({
    // Unlike `content` (the ScrollView's contentContainerStyle, sized to fit its children), this
    // wraps the ScrollView itself so it inherits the screen's actual height from the navigator.
    // Without it, the ScrollView's own frame collapses to its content's height instead of the
    // viewport's — same flex:1-container-around-a-bare-ScrollView pattern Dashboard.tsx and
    // BeachList.tsx use — and anything past the physical screen height becomes both invisible and
    // unreachable: the ScrollView never sees an overflow to scroll, so it doesn't scroll at all.
    container: {
      flex: 1,
      backgroundColor: tokens.bg,
    },
    content: {
      padding: 16,
      // This screen is pushed on RootStack above (not inside) the bottom tab navigator (see
      // RootNavigator.tsx), so unlike Dashboard/BeachList — whose content sits above a tab bar
      // that already reserves the bottom safe area — there's nothing here to absorb the home
      // indicator / gesture-nav inset. Add it on top of the base 16 so the last bit of content
      // (e.g. the Sea panel) doesn't end up scrolled-to-the-bottom yet still hidden under it,
      // same reasoning ToastViewport.tsx's insets.bottom + fixed-offset pattern gives.
      paddingBottom: 16 + insetBottom,
      gap: 16,
    },
    heroRow: {
      gap: 16,
    },
    imageArea: {
      width: "100%",
      aspectRatio: IMAGE_ASPECT_RATIO,
      maxHeight: IMAGE_MAX_HEIGHT,
      borderRadius: BORDER_RADIUS,
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    iconChip: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: tokens.iconChip,
    },
    badges: {
      width: "100%",
      gap: 16,
    },
    description: {
      fontSize: 14,
      lineHeight: 21,
      color: tokens.text,
      justifyContent: "center",
    },
    error: {
      fontSize: 14,
      color: tokens.error,
    },
    meta: {
      fontSize: 13,
      color: tokens.text,
    },
    offWindow: {
      fontSize: 13,
      color: tokens.text,
      opacity: 0.8,
    },
  });
}
