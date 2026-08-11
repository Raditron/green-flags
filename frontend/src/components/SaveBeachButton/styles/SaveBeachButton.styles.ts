import type { CSSProperties } from "react";

type SaveBeachButtonStyleKey = "button" | "icon";

export function getSaveBeachButtonStyles({
  isHovered,
  saved,
  withLabel,
}: {
  isHovered: boolean;
  saved: boolean;
  withLabel: boolean;
}): Record<SaveBeachButtonStyleKey, CSSProperties> {
  // Filled and hovered both preview the same gold tint the filled star itself uses, so hovering
  // an unsaved star hints at what tapping it will look like.
  const active = saved || isHovered;

  return {
    // Matches the list card's ghost-styled Report link when labelled — same flex/padding/type
    // treatment, just gold instead of red — so the two actions read as one pair. Icon-only spots
    // (e.g. the detail page title) keep the compact square button instead.
    button: withLabel
      ? {
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "9px 6px",
          border: "none",
          borderRadius: 8,
          fontSize: 12.5,
          fontWeight: 600,
          fontFamily: "inherit",
          color: active ? "var(--flag-yellow)" : "var(--text)",
          background: active ? "color-mix(in srgb, var(--flag-yellow) 14%, transparent)" : "transparent",
          cursor: "pointer",
          transition: "background 0.12s ease, color 0.12s ease",
        }
      : {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: 40,
          height: 40,
          border: "none",
          borderRadius: 8,
          background: active ? "color-mix(in srgb, var(--flag-yellow) 16%, transparent)" : "transparent",
          cursor: "pointer",
          transition: "background 0.12s ease, color 0.12s ease",
        },
    icon: {
      width: withLabel ? 14 : 16,
      height: withLabel ? 14 : 16,
      color: active ? "var(--flag-yellow)" : "var(--text)",
    },
  };
}
