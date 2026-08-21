import { StyleSheet } from "react-native";
import { mixHex } from "../../../../../shared/styles/colorMix";
import { flagColorFor } from "../../../../../shared/styles/flagColor";
import { BORDER_RADIUS } from "../../../../../theme/tokens";
import type { ThemeTokens } from "../../../../../theme/tokens";
import type { FlagColor } from "../../../../../shared/types/Beach";

// RN port of frontend's ReportPrompt/styles/ReportPrompt.styles.ts. No hover state (no RN
// equivalent for touch) — getFlagOptionStyle varies by pressed/submitting instead.
export function getReportPromptStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    prompt: {
      marginBottom: 14,
      color: tokens.textHeading,
      fontWeight: "600",
      fontSize: 14,
    },
    options: {
      flexDirection: "row",
      gap: 14,
    },
    swatch: {
      alignItems: "center",
      justifyContent: "center",
      width: 34,
      height: 34,
      borderRadius: 17,
    },
    icon: {
      color: "#fff",
    },
  });
}

// Tinted rather than the flat bordered-square look: rest state hints at the flag color through
// a faint wash + border (mixHex over --surface, the same recipe SaveBeachButton's active gold
// tint uses), pressed deepens both — echoing the solid flag-color treatment Verdict uses
// full-bleed, just dialed down since three of these sit side by side.
export function getFlagOptionStyle(flagColor: FlagColor, tokens: ThemeTokens, pressed: boolean, submitting: boolean) {
  const color = flagColorFor(flagColor, tokens);
  const tint = pressed ? 20 : 10;
  const borderTint = pressed ? 55 : 30;

  return StyleSheet.create({
    option: {
      flex: 1,
      alignItems: "center",
      gap: 9,
      borderWidth: 1,
      borderColor: mixHex(color, tokens.border, borderTint),
      borderRadius: BORDER_RADIUS,
      backgroundColor: mixHex(color, tokens.surface, tint),
      paddingVertical: 14,
      paddingHorizontal: 8,
      opacity: submitting ? 0.6 : 1,
    },
    label: {
      fontSize: 13,
      fontWeight: "700",
      color: tokens.textHeading,
    },
  });
}
