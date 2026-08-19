import { StyleSheet } from "react-native";
import { BORDER_RADIUS } from "../../../../../theme/tokens";
import type { ThemeTokens } from "../../../../../theme/tokens";

export type ForecastStripChipState = "pending" | "resolved" | "failed";

interface ForecastStripChipStyleArgs {
  state: ForecastStripChipState;
  selected: boolean;
}

// RN port of frontend's ForecastStripChip.styles.ts. Three visually distinct looks per chip
// state: pending (neutral placeholder dot), resolved (full-strength, flag-colored dot — set by
// the caller via an inline override, see ForecastStripChip.tsx), failed (muted, unpressable —
// there's no day to view yet).
export function getForecastStripChipStyles(tokens: ThemeTokens, { state, selected }: ForecastStripChipStyleArgs) {
  return StyleSheet.create({
    button: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: "100%",
      borderWidth: 1,
      borderColor: selected ? tokens.textHeading : tokens.border,
      borderRadius: BORDER_RADIUS,
      paddingVertical: 14,
      paddingHorizontal: 8,
      // --surface, not --border, for the selected fill — see frontend's styles for why: --border
      // is a light outline color in both themes, so using it as a solid fill would just reproduce
      // the light-mode look in dark mode. --surface is the token actually themed per-mode.
      backgroundColor: selected ? tokens.surface : "transparent",
      opacity: state === "failed" ? 0.5 : 1,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: tokens.border,
    },
    label: {
      fontSize: 14,
      color: tokens.text,
    },
    // Smaller, muted caption underneath the day label.
    date: {
      fontSize: 11,
      opacity: 0.7,
      marginTop: -4,
      color: tokens.text,
    },
  });
}
