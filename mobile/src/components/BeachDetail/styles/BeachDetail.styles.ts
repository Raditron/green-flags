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

export function getBeachDetailStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    content: {
      padding: 16,
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
