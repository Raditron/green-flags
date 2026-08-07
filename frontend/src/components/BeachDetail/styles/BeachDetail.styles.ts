import type { CSSProperties } from "react";

type BeachDetailStyleKey =
  | "page"
  | "back"
  | "backContainer"
  | "backIcon"
  | "main"
  | "heroRow"
  | "imageArea"
  | "image"
  | "iconChip"
  | "icon"
  | "badges"
  | "description"
  | "error"
  | "meta"
  | "refreshing"
  | "offWindow"
  | "title"
  ;

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
    // Back arrow sits in its own column to the left of everything else, so title,
    // hero image and description all share one left edge (the main column's) instead
    // of the arrow's — only the arrow overhangs further left.
    page: {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      width: "100%",
      maxWidth: 900,
      margin: "0 auto",
    },
    main: {
      display: "flex",
      flexDirection: "column",
      flex: "1 1 auto",
      minWidth: 0,
    },
    title: {
      margin: "0 0 16px",
      fontSize: "2rem",
      fontWeight: 700,
      letterSpacing: "-0.01em",
      color: "var(--text-h)",
    },
    // Icon-only control (no visible "Back to beaches" label — that lives in aria-label
    // instead); hover swaps in a subtle circular background rather than an underline.
    // A small top offset optically centers the 36px circle against the title's cap-height.
    backContainer: {
      display: "flex",
      flexShrink: 0,
      marginTop: 4,
    },
    back: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: backHovered ? "var(--surface)" : "transparent",
      color: "var(--text)",
      transition: "background 0.15s ease",
    },
    backIcon: {
      width: 18,
      height: 18,
    },
    // Image takes ~3/4 of the row, the prediction badges take the remaining ~1/4 —
    // description then flexes full-width below this row (see `description`).
    heroRow: {
      display: "flex",
      flexDirection: "row",
      alignItems: "stretch",
      gap: 16,
    },
    imageArea: {
      position: "relative",
      flex: "3 1 0%",
      minWidth: 0,
      aspectRatio: IMAGE_ASPECT_RATIO,
      maxHeight: IMAGE_MAX_HEIGHT,
      borderRadius: 12,
      overflow: "hidden",
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
    // Prediction meta + Timeline card + confidence ring stack vertically here instead of
    // competing for row space with the image — each is full-width within this column.
    badges: {
      flex: "1 1 0%",
      minWidth: 140,
      display: "flex",
      flexDirection: "column",
      gap: 16,
    },
    description: {
      margin: "16px 0 0",
      fontSize: 14,
      lineHeight: 1.5,
      color: "var(--text)",
    },
    error: {
      color: "#b91c1c",
    },
    meta: {
      margin: 0,
      fontSize: 13,
      color: "var(--text)",
    },
    refreshing: {
      marginLeft: 6,
      color: "var(--text)",
      opacity: 0.7,
    },
    offWindow: {
      margin: 0,
      fontSize: 13,
      color: "var(--text)",
      opacity: 0.8,
    },
  };
}
