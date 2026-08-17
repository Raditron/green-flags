import { StyleSheet } from "react-native";

/**
 * Mirrors frontend's `styles/X.styles.ts` convention (a `getXStyles()` function returning a
 * style-object map) so later tickets can port frontend styling 1:1. Once #93 lands the token
 * module, this reads from it instead of the hardcoded placeholder values below so theme changes
 * re-derive styles the same way the web version re-renders CSS custom properties.
 */
export function getBeachDetailStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    heading: {
      fontSize: 20,
      fontWeight: "600",
    },
    beachId: {
      fontSize: 14,
      marginTop: 4,
    },
  });
}
