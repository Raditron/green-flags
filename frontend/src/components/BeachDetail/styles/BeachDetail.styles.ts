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
  | "titleRow"
  ;

// The hero image now spans the full page width (data cards moved below it),
// so it reads as a wide banner rather than the old 3/4-column crop — a wider
// ratio plus a taller cap keeps it a real focal point instead of a sliver.
const IMAGE_ASPECT_RATIO = "12 / 5";
const IMAGE_MAX_HEIGHT = "min(400px, 46vh)";

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
      margin: 0,
      fontSize: "2rem",
      fontWeight: 700,
      letterSpacing: "-0.01em",
      color: "var(--text-h)",
    },
    // Star sits directly beside the name (flex-start, not spread to the row's far edge)
    // rather than in the actions row further down like the list card — same icon-only
    // button as the list card, just placed next to the title per #25.
    titleRow: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      margin: "0 0 16px",
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
    // Image spans the full row on top; the prediction cards (time, confidence,
    // conditions) sit as their own full-width row underneath (see `badges`) —
    // description then flexes full-width below all of that (see `description`).
    heroRow: {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: 16,
    },
    imageArea: {
      position: "relative",
      width: "100%",
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
    // Off-window notice / Timeline (time, confidence ring, conditions — laid out
    // horizontally inside Timeline itself) / meta text stack vertically here, full-width
    // below the image rather than squeezed into a narrow side column.
    badges: {
      width: "100%",
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
