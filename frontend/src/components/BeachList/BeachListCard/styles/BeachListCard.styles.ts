import type { CSSProperties } from "react";
import { flagColorVar } from "../../../../shared/styles/flagColor";
import { neutralHintTextStyle } from "../../../../shared/styles/neutralHint";

type BeachListCardStyleKey =
  | "card"
  | "mediaLink"
  | "imageArea"
  | "image"
  | "iconChip"
  | "icon"
  | "confidence"
  | "content"
  | "name"
  | "statusRow"
  | "flagIcon"
  | "statusText"
  | "distanceText"
  | "divider"
  | "actions"
  | "commentButton"
  | "commentIcon"
  | "reportButton"
  | "reportIcon";

// Matches the reference design's tall, photo-forward banner instead of a
// short fixed-height strip.
const IMAGE_ASPECT_RATIO = "37 / 20";

export function getBeachListCardStyles({
  isHovered,
  isFocused,
  isCommentHovered,
  isReportHovered,
}: {
  isHovered: boolean;
  isFocused: boolean;
  isCommentHovered: boolean;
  isReportHovered: boolean;
}): Record<BeachListCardStyleKey, CSSProperties> {
  const isRaised = isHovered || isFocused;

  return {
    // The outer panel owns the raised-hover treatment and clips the image's
    // top corners to its own radius; the two interactive children inside
    // (media link, report link) sit flush against its edges.
    card: {
      display: "flex",
      flexDirection: "column",
      background: "var(--surface)",
      border: `1px solid ${isRaised ? "var(--text-h)" : "transparent"}`,
      borderRadius: 16,
      overflow: "hidden",
      outline: isFocused ? "2px solid var(--text-h)" : "2px solid transparent",
      outlineOffset: 2,
      boxShadow: isRaised ? "0 4px 10px rgba(0, 0, 0, 0.28)" : "0 1px 4px rgba(0, 0, 0, 0.18)",
      transform: isRaised ? "translateY(-1px)" : "none",
      transition:
        "border-color 0.15s ease, transform 0.15s ease, outline-color 0.15s ease, box-shadow 0.15s ease",
    },
    mediaLink: {
      display: "flex",
      flexDirection: "column",
      color: "inherit",
      textDecoration: "none",
      outline: "none",
    },
    imageArea: {
      position: "relative",
      flexShrink: 0,
      width: "100%",
      aspectRatio: IMAGE_ASPECT_RATIO,
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
      width: 56,
      height: 56,
      color: "var(--icon-chip-fg)",
    },
    // Confidence lost its header-row slot once the layout stacked instead
    // of running side by side, so it rides on the photo itself.
    confidence: {
      position: "absolute",
      top: 10,
      right: 10,
      background: "var(--media-badge-bg)",
      color: "var(--media-badge-fg)",
      fontSize: 12,
      fontWeight: 700,
      padding: "4px 9px",
      borderRadius: 100,
    },
    content: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      padding: "14px 16px 12px",
    },
    name: {
      fontSize: 16.5,
      fontWeight: 700,
      color: "var(--text-h)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    statusRow: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      fontSize: 13,
      color: "var(--text)",
    },
    flagIcon: {
      width: 14,
      height: 14,
      flexShrink: 0,
    },
    statusText: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    distanceText: neutralHintTextStyle,
    divider: {
      height: 1,
      background: "var(--border)",
      margin: "0 16px",
    },
    actions: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: 8,
    },
    // Ghost button; picks up the same heading-blue tint the card's own raised-hover border
    // uses, keeping it visually distinct from the gold Save and red Report actions either
    // side of it.
    commentButton: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: "9px 6px",
      borderRadius: 8,
      fontSize: 12.5,
      fontWeight: 600,
      color: isCommentHovered ? "var(--text-h)" : "var(--text)",
      background: isCommentHovered ? "color-mix(in srgb, var(--text-h) 14%, transparent)" : "transparent",
      textDecoration: "none",
      transition: "background 0.12s ease, color 0.12s ease",
    },
    commentIcon: {
      width: 14,
      height: 14,
    },
    // Ghost button; picks up a red tint on hover to preview the report flow
    // it leads to, rather than the neutral hover the rest of the card uses.
    reportButton: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: "9px 6px",
      borderRadius: 8,
      fontSize: 12.5,
      fontWeight: 600,
      color: isReportHovered ? "var(--flag-red)" : "var(--text)",
      background: isReportHovered ? "color-mix(in srgb, var(--flag-red) 14%, transparent)" : "transparent",
      textDecoration: "none",
      transition: "background 0.12s ease, color 0.12s ease",
    },
    reportIcon: {
      width: 14,
      height: 14,
    },
  };
}

export function getFlagIconColorStyle(flagColor: string | undefined): CSSProperties {
  return { color: flagColorVar(flagColor) };
}
