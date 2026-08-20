import { StyleSheet } from "react-native";

// RN port of frontend's ForecastStrip.styles.ts. No `list` margin override needed here — RN has
// no CSS list styling to reset, and the parent stack already applies its own gap between children
// (see BeachDetail.styles.ts), same reasoning frontend's comment gives.
//
// Unlike frontend (which keeps all 7 chips on one row via horizontal scroll), mobile has no
// scroll affordance here, and shrinking chips down to fit 7 in one row made them illegibly
// cramped on narrow phones. Instead chips get a standard minimum size (item.flexBasis below)
// and `flexWrap` lets chips that don't fit spill onto a second row — `flexGrow: 1` then
// stretches each row's chips to fill the leftover width evenly, so a short second row (e.g.
// 3 chips) doesn't leave dead space on the right.
export function getForecastStripStyles() {
  return StyleSheet.create({
    list: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    item: {
      flexGrow: 1,
      flexBasis: 76,
    },
  });
}
