import type { ThemeTokens } from "../../theme/tokens";
import type { FlagColor } from "../types/Beach";

// RN port of frontend/src/shared/styles/flagColor.ts. `flagColorVar` returns a CSS custom
// property name there because the web app recolors via CSS vars; RN has no such thing, so this
// takes the caller's already-resolved `ThemeTokens` and returns a concrete color string instead —
// same fallback-to-neutral behavior for an unrecognized/missing color.
//
// Both flagColorFor and getFlagStatusText derive from this one map rather than each running their
// own switch on FlagColor, so the three flag colors are declared in exactly one place.
const FLAG_META: Record<FlagColor, { tokenKey: keyof Pick<ThemeTokens, "flagGreen" | "flagYellow" | "flagRed">; statusText: string }> = {
  green: { tokenKey: "flagGreen", statusText: "Green flag · safe to swim" },
  yellow: { tokenKey: "flagYellow", statusText: "Yellow flag · caution advised" },
  red: { tokenKey: "flagRed", statusText: "Red flag · no swimming" },
};

export function flagColorFor(flagColor: FlagColor | undefined, tokens: ThemeTokens): string {
  return flagColor === undefined ? tokens.border : tokens[FLAG_META[flagColor].tokenKey];
}

// First-draft copy, not approved safety/legal language. Returns undefined
// when there's no flag prediction to report on.
export function getFlagStatusText(flagColor: FlagColor | undefined): string | undefined {
  return flagColor === undefined ? undefined : FLAG_META[flagColor].statusText;
}
