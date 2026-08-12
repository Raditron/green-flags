import type { CSSProperties } from "react";
import type { TooltipAlign } from "../interfaces";

type TooltipStyleKey = "wrapper" | "bubble";

// Horizontal anchor per alignment — paired with the matching translateX so
// the bubble grows away from whichever edge it's pinned to.
const ALIGN_POSITION: Record<TooltipAlign, CSSProperties> = {
  start: { left: 0 },
  center: { left: "50%" },
  end: { right: 0 },
};

const ALIGN_TRANSLATE_X: Record<TooltipAlign, number> = {
  start: 0,
  center: -50,
  end: 0,
};

export function getTooltipStyles({
  align,
  isVisible,
}: {
  align: TooltipAlign;
  isVisible: boolean;
}): Record<TooltipStyleKey, CSSProperties> {
  const translateY = isVisible ? 0 : -2;

  return {
    // Just an anchor for the bubble — carries no visual treatment of its
    // own, so dropping it around any trigger (icon, badge, button) can't
    // change that trigger's layout.
    wrapper: {
      position: "relative",
      display: "inline-flex",
    },
    // Same floating-surface treatment as the app's other popovers (AreaSelect's
    // dropdown, UserMenu, Toast): var(--surface) chip, var(--border) outline,
    // a soft shadow to lift it off the page — not a separate, inverted look.
    bubble: {
      position: "absolute",
      top: "calc(100% + 6px)",
      zIndex: 20,
      ...ALIGN_POSITION[align],
      width: "max-content",
      maxWidth: 200,
      padding: "8px 10px",
      borderRadius: 8,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.18)",
      color: "var(--text)",
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.35,
      opacity: isVisible ? 1 : 0,
      pointerEvents: "none",
      transform: `translateX(${ALIGN_TRANSLATE_X[align]}%) translateY(${translateY}px)`,
      transition: "opacity 0.12s ease, transform 0.12s ease",
      visibility: isVisible ? "visible" : "hidden",
      whiteSpace: "normal",
    },
  };
}
