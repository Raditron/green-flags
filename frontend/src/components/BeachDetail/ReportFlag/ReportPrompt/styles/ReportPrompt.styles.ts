import type { CSSProperties } from "react";
import { flagColorVar } from "../../../../../shared/styles/flagColor";

type ReportPromptStyleKey = "prompt" | "options";

export function getReportPromptStyles(): Record<ReportPromptStyleKey, CSSProperties> {
  return {
    prompt: {
      margin: "0 0 14px",
      color: "var(--text-h)",
      fontWeight: 600,
      fontSize: 14,
    },
    options: {
      display: "flex",
      gap: 14,
    },
  };
}

// Tinted rather than the flat bordered-square look: rest state hints at the flag color through
// a faint wash + border (color-mix over --surface, same recipe SaveBeachButton uses for its
// active gold tint), hover deepens both — echoing the solid flag-color treatment Verdict uses
// full-bleed, just dialed down since three of these sit side by side.
export function getFlagOptionStyle(flagColor: string, hovered: boolean, submitting: boolean): CSSProperties {
  const tint = hovered ? "20%" : "10%";
  const borderTint = hovered ? "55%" : "30%";

  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 9,
    flex: 1,
    border: `1px solid color-mix(in srgb, ${flagColorVar(flagColor)} ${borderTint}, var(--border))`,
    borderRadius: 12,
    background: `color-mix(in srgb, ${flagColorVar(flagColor)} ${tint}, var(--surface))`,
    color: "var(--text-h)",
    padding: "16px 8px 14px",
    font: "inherit",
    fontSize: 13,
    fontWeight: 700,
    cursor: submitting ? "default" : "pointer",
    opacity: submitting ? 0.6 : 1,
    transform: hovered && !submitting ? "translateY(-1px)" : "none",
    transition: "background 0.15s ease, border-color 0.15s ease, transform 0.1s ease",
  };
}

// Solid-color swatch instead of a bare colored icon — a small echo of Verdict's full-bleed
// flag-color panel, so picking a color here visually rhymes with the banner it's reporting on.
export function getFlagOptionSwatchStyle(flagColor: string): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: flagColorVar(flagColor),
  };
}

export function getFlagOptionIconStyle(): CSSProperties {
  return {
    width: 16,
    height: 16,
    color: "#fff",
  };
}
