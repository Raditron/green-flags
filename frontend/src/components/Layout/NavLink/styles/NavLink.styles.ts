import type { CSSProperties } from "react";

// Shared pill treatment for the header nav links: a button-style outline
// that's invisible at rest and a drop shadow that lifts in on hover/focus,
// so the header reads as clickable chips rather than plain text.
export function getNavLinkStyles({
  isHovered,
  isFocused,
}: {
  isHovered: boolean;
  isFocused: boolean;
}): CSSProperties {
  const isRaised = isHovered || isFocused;

  return {
    color: "var(--text)",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    padding: "6px 12px",
    borderRadius: 999,
    border: `1px solid ${isRaised ? "var(--text-h)" : "transparent"}`,
    outline: isFocused ? "2px solid var(--text-h)" : "2px solid transparent",
    outlineOffset: 2,
    boxShadow: isRaised ? "0 4px 10px rgba(0, 0, 0, 0.22)" : "none",
    transform: isRaised ? "translateY(-1px)" : "none",
    transition:
      "border-color 0.15s ease, transform 0.15s ease, outline-color 0.15s ease, box-shadow 0.15s ease",
  };
}
