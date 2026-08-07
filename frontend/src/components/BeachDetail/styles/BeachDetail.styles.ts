import type { CSSProperties } from "react";

type BeachDetailStyleKey =
  | "content"
  | "back"
  | "backContainer"
  | "backIcon"
  | "imageArea"
  | "image"
  | "iconChip"
  | "icon"
  | "error"
  | "meta"
  | "refreshing"
  | "offWindow";

// On the card grid this ratio sits in a ~440px-wide column; stretched to the
// full page width it makes the image absurdly tall, so the detail page caps
// it with a max-height instead of letting aspect-ratio alone drive height.
const IMAGE_ASPECT_RATIO = "37 / 20";
const IMAGE_MAX_HEIGHT = "min(320px, 40vh)";

export function getBeachDetailStyles({
  backHovered,
}: {
  backHovered: boolean;
}): Record<BeachDetailStyleKey, CSSProperties> {
  return {
    // Caps content width to match the beach list's card grid (see BeachList.styles.ts)
    // instead of letting the image and text stretch full-bleed on wide viewports.
    content: {
      width: "100%",
      maxWidth: 900,
      margin: "0 auto",
    },
    // Icon-only control (no visible "Back to beaches" label — that lives in aria-label
    // instead); hover swaps in a subtle circular background rather than an underline.
    backContainer: {
      display: "flex",
      borderWidth: 1,
    },
    back: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      marginBottom: 12,
      borderRadius: "50%",
      background: backHovered ? "var(--surface)" : "transparent",
      color: "var(--text)",
      transition: "background 0.15s ease",
    },
    backIcon: {
      width: 18,
      height: 18,
    },
    imageArea: {
      position: "relative",
      width: "100%",
      aspectRatio: IMAGE_ASPECT_RATIO,
      maxHeight: IMAGE_MAX_HEIGHT,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 12,
    },
    image: {
      display: "block",
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    iconChip: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--icon-chip)",
    },
    icon: {
      width: 64,
      height: 64,
      color: "var(--icon-chip-fg)",
    },
    error: {
      color: "#b91c1c",
    },
    meta: {
      margin: "4px 0 0",
      fontSize: 13,
      color: "var(--text)",
    },
    refreshing: {
      marginLeft: 6,
      color: "var(--text)",
      opacity: 0.7,
    },
    offWindow: {
      margin: "12px 0 0",
      fontSize: 13,
      color: "var(--text)",
      opacity: 0.8,
    },
  };
}
