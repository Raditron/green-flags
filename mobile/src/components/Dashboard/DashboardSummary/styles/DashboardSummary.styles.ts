import { StyleSheet } from "react-native";

// RN port of frontend/src/components/Dashboard/DashboardSummary/styles/DashboardSummary.styles.ts.
// Web's CSS Grid `repeat(auto-fill, minmax(260px, 1fr))` has no direct RN equivalent; a flex-wrap
// row with each card given `flexBasis: 260, flexGrow: 1` (see `cardWrap` below) reflows the same
// way — columns wrap on their own rather than a fixed column count — and on a typical phone width
// simply collapses to one column per row, same as a narrow web viewport would.
export function getDashboardSummaryStyles() {
  return StyleSheet.create({
    grid: {
      marginTop: 20,
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },
    cardWrap: {
      flexBasis: 260,
      flexGrow: 1,
    },
  });
}
