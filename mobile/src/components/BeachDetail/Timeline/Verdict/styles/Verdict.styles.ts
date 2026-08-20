import { StyleSheet } from "react-native";
import { flagColorFor } from "../../../../../shared/styles/flagColor";
import { BORDER_RADIUS } from "../../../../../theme/tokens";
import type { ThemeTokens } from "../../../../../theme/tokens";
import type { FlagColor } from "../../../interfaces";

// RN port of frontend's Verdict.styles.ts. `desaturated` (the off-window "estimate only" state)
// approximates frontend's `filter: grayscale(0.75) opacity(0.65)` with opacity alone — RN's View
// has no `filter`/grayscale equivalent — which reads as "muted" rather than literally desaturated,
// close enough for the same "this isn't a live reading" signal.
export function getVerdictStyles(tokens: ThemeTokens, { flagColor, desaturated }: { flagColor: FlagColor; desaturated: boolean }) {
  return StyleSheet.create({
    panel: {
      alignItems: "center",
      gap: 12,
      padding: 18,
      borderRadius: BORDER_RADIUS,
      backgroundColor: flagColorFor(flagColor, tokens),
      opacity: desaturated ? 0.65 : 1,
    },
    icon: {
      position: "absolute",
      top: 18,
      left: 20,
      opacity: 0.9,
    },
    textCol: {
      alignItems: "center",
      gap: 4,
    },
    headline: {
      fontSize: 20,
      fontWeight: "800",
      color: "#fff",
      textAlign: "center",
    },
    sentence: {
      fontSize: 14.5,
      color: "#fff",
      opacity: 0.92,
      textAlign: "center",
    },
    caution: {
      fontSize: 13,
      fontWeight: "700",
      color: "#fff",
      marginTop: 2,
      textAlign: "center",
    },
  });
}
