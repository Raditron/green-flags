import { StyleSheet } from "react-native";
import { hexToRgba } from "../../../shared/styles/colorMix";
import type { ThemeTokens } from "../../../theme/tokens";

/**
 * RN port of frontend's SaveBeachButton.styles.ts's icon-only branch (the `withLabel` branch has
 * no mobile counterpart yet — see this component's interfaces/index.ts). Filled and pressed both
 * preview the same gold tint the filled star itself uses, so pressing an unsaved star hints at
 * what tapping it will look like — same "active" idea as frontend's `saved || isHovered`, with
 * `pressed` standing in for hover (RN has no hover on touch devices).
 */
export function getSaveBeachButtonStyles(tokens: ThemeTokens, { active }: { active: boolean }) {
  return StyleSheet.create({
    button: {
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      width: 40,
      height: 40,
      borderRadius: 999,
      backgroundColor: active ? hexToRgba(tokens.flagYellow, 16) : "transparent",
    },
  });
}

export function saveBeachButtonIconColor(tokens: ThemeTokens, active: boolean): string {
  return active ? tokens.flagYellow : tokens.text;
}
