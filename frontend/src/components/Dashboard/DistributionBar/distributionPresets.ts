import type { ConfidenceBasis, FlagColor, RipCurrentRisk } from "../interfaces";

export interface DistributionBarPreset<K extends string> {
  order: readonly K[];
  colorForKey: Record<K, string>;
  labelForKey: Record<K, string>;
}

// Severity-ordered low → high, matching the backend's own FLAG_COLOR_SEVERITY_ORDER, and reusing
// the same --flag-* tokens as every other flag-colored element in the app.
export const FLAG_COLOR_BAR: DistributionBarPreset<FlagColor> = {
  order: ["green", "yellow", "red"],
  colorForKey: { green: "var(--flag-green)", yellow: "var(--flag-yellow)", red: "var(--flag-red)" },
  labelForKey: { green: "Green", yellow: "Yellow", red: "Red" },
};

// Severity-ordered low → high, matching the backend's own RIP_CURRENT_RISK_SEVERITY_ORDER.
export const RIP_CURRENT_RISK_BAR: DistributionBarPreset<RipCurrentRisk> = {
  order: ["low", "moderate", "high"],
  colorForKey: { low: "var(--flag-green)", moderate: "var(--flag-yellow)", high: "var(--flag-red)" },
  labelForKey: { low: "Low", moderate: "Moderate", high: "High" },
};

// Neutral blues, not the flag palette — how much data backs today's average is a different
// signal than whether it's safe to swim, the same distinction ADR 0004 draws for the beach-detail
// confidence meter. Built from var(--text), which is itself colors.blue's chathamsBlue (light
// theme) / nepal (dark theme), so this stays theme-aware without hardcoding either palette.
// "Certain" gets the full, solid tone; "prior" (a pure statistical fallback, no matching reports)
// fades furthest from it; "blended" (a mix of both) sits in between.
export const CONFIDENCE_BASIS_BAR: DistributionBarPreset<ConfidenceBasis> = {
  order: ["certain", "blended", "prior"],
  colorForKey: {
    certain: "var(--text)",
    blended: "color-mix(in srgb, var(--text) 65%, var(--surface))",
    prior: "color-mix(in srgb, var(--text) 35%, var(--surface))",
  },
  labelForKey: { certain: "Certain", blended: "Blended", prior: "Prior" },
};
