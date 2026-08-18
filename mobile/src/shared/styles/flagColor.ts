import type { ThemeTokens } from "../../theme/tokens";

// RN port of frontend/src/shared/styles/flagColor.ts. `flagColorVar` returns a CSS custom
// property name there because the web app recolors via CSS vars; RN has no such thing, so this
// takes the caller's already-resolved `ThemeTokens` and returns a concrete color string instead —
// same fallback-to-neutral behavior for an unrecognized/missing color.
export function flagColorFor(flagColor: string | undefined, tokens: ThemeTokens): string {
  switch (flagColor) {
    case "green":
      return tokens.flagGreen;
    case "yellow":
      return tokens.flagYellow;
    case "red":
      return tokens.flagRed;
    default:
      return tokens.border;
  }
}

// First-draft copy, not approved safety/legal language. Returns undefined
// when there's no flag prediction to report on.
export function getFlagStatusText(flagColor: string | undefined): string | undefined {
  switch (flagColor) {
    case "green":
      return "Green flag · safe to swim";
    case "yellow":
      return "Yellow flag · caution advised";
    case "red":
      return "Red flag · no swimming";
    default:
      return undefined;
  }
}
