import { mixHex } from "../../../shared/styles/colorMix";
import type { ThemeTokens } from "../../../theme/tokens";
import type { ConfidenceBasis, FlagColor, RipCurrentRisk } from "../interfaces";

export interface DistributionBarPreset<K extends string> {
  order: readonly K[];
  colorForKey: Record<K, string>;
  labelForKey: Record<K, string>;
}

// RN port of frontend/src/components/Dashboard/DistributionBar/distributionPresets.ts. Frontend's
// presets are static objects built from CSS custom properties (`var(--flag-green)`, ...) that
// resolve at paint time; RN has no such indirection; a `ThemeTokens` value is already resolved
// per-render (see theme/tokens.ts), so these are functions of it instead, called fresh by
// SeaSummaryCard/AreaCard on every render — same "component stays ignorant of what it's charting"
// shape as frontend's, just parameterized by tokens rather than baked in at module scope.

// Severity-ordered low → high, matching the backend's own FLAG_COLOR_SEVERITY_ORDER, and reusing
// the same theme tokens as every other flag-colored element in the app.
export function getFlagColorBar(tokens: ThemeTokens): DistributionBarPreset<FlagColor> {
  return {
    order: ["green", "yellow", "red"],
    colorForKey: { green: tokens.flagGreen, yellow: tokens.flagYellow, red: tokens.flagRed },
    labelForKey: { green: "Green", yellow: "Yellow", red: "Red" },
  };
}

// Severity-ordered low → high, matching the backend's own RIP_CURRENT_RISK_SEVERITY_ORDER.
export function getRipCurrentRiskBar(tokens: ThemeTokens): DistributionBarPreset<RipCurrentRisk> {
  return {
    order: ["low", "moderate", "high"],
    colorForKey: { low: tokens.flagGreen, moderate: tokens.flagYellow, high: tokens.flagRed },
    labelForKey: { low: "Low", moderate: "Moderate", high: "High" },
  };
}

// Neutral blues, not the flag palette — how much data backs today's average is a different
// signal than whether it's safe to swim, the same distinction ADR 0004 draws for the beach-detail
// confidence meter. Built from tokens.text (itself colors.blue's chathamsBlue (light theme) /
// nepal (dark theme) — see theme/tokens.ts), so this stays theme-aware without hardcoding either
// palette. "Certain" gets the full, solid tone; "prior" (a pure statistical fallback, no matching
// reports) fades furthest from it; "blended" (a mix of both) sits in between.
export function getConfidenceBasisBar(tokens: ThemeTokens): DistributionBarPreset<ConfidenceBasis> {
  return {
    order: ["certain", "blended", "prior"],
    colorForKey: {
      certain: tokens.text,
      blended: mixHex(tokens.text, tokens.surface, 65),
      prior: mixHex(tokens.text, tokens.surface, 35),
    },
    labelForKey: { certain: "Certain", blended: "Blended", prior: "Prior" },
  };
}
