import { StyleSheet } from "react-native";

// RN port of frontend's ForecastStrip.styles.ts. No `list` margin override needed here — RN has
// no CSS list styling to reset, and the parent stack already applies its own gap between children
// (see BeachDetail.styles.ts), same reasoning frontend's comment gives.
export function getForecastStripStyles() {
  return StyleSheet.create({
    list: {
      flexDirection: "row",
      gap: 8,
    },
    // flex: 1 lets each chip grow to fill the row evenly; minWidth: 0 lets a chip shrink below
    // its content's natural width if the row gets too narrow to fit all 7 (matches frontend).
    item: {
      flex: 1,
      minWidth: 0,
    },
  });
}
