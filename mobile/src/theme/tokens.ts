import type { Theme } from "./resolveTheme";

/**
 * RN port of every custom property in `frontend/src/index.css`'s `:root` block (both the light
 * defaults and the `:root[data-theme="dark"]` overrides) — see issue #91's "Design tokens &
 * theming" decision and #93. `textHeading` mirrors `--text-h`; it isn't called out by name in
 * #93's acceptance criteria, but "every custom property" is, and h1/h2 need it for parity.
 */
export interface ThemeTokens {
  text: string;
  textHeading: string;
  bg: string;
  border: string;
  surface: string;
  flagGreen: string;
  flagYellow: string;
  flagRed: string;
  error: string;
  info: string;
  iconChip: string;
  iconChipFg: string;
  mediaBadgeBg: string;
  mediaBadgeFg: string;
}

export const LIGHT_TOKENS: ThemeTokens = {
  text: "#134074",
  textHeading: "#0b2545",
  bg: "#eaf0f6",
  border: "#c1d1e1",
  surface: "#f8fafb",
  flagGreen: "#16a34a",
  flagYellow: "#ca8a04",
  flagRed: "#dc2626",
  error: "#b91c1c",
  info: "#2563eb",
  iconChip: "#8da9c4",
  iconChipFg: "#0b2545",
  // downriver, translucent — held constant across themes (see mediaBadgeFg below) so it reads
  // against arbitrary photo content instead of flipping with the page chrome.
  mediaBadgeBg: "rgba(11, 37, 69, 0.72)",
  mediaBadgeFg: "#f8fafb",
};

// index.css's `:root[data-theme="dark"]` block only overrides text/bg/border/surface/icon-chip/
// info — flagGreen/flagYellow/flagRed/error/mediaBadgeBg/mediaBadgeFg fall through to the same
// values as light via the CSS cascade, so they're repeated verbatim here rather than overridden.
export const DARK_TOKENS: ThemeTokens = {
  text: "#8da9c4",
  textHeading: "#eef4ed",
  bg: "#1A1C22",
  border: "#8da9c4",
  surface: "#13315c",
  flagGreen: "#16a34a",
  flagYellow: "#ca8a04",
  flagRed: "#dc2626",
  error: "#b91c1c",
  info: "#60a5fa",
  iconChip: "#134074",
  iconChipFg: "#8da9c4",
  mediaBadgeBg: "rgba(11, 37, 69, 0.72)",
  mediaBadgeFg: "#f8fafb",
};

export const THEME_TOKENS: Record<Theme, ThemeTokens> = {
  light: LIGHT_TOKENS,
  dark: DARK_TOKENS,
};

/**
 * The default border radius for cards, panels, buttons, inputs, and other boxy elements — see
 * `frontend/CONVENTIONS.md`'s "Border radius" convention. Pill/fully-round shapes (`999`, `"50%"`)
 * are a different, deliberate shape language (chips, avatars, toggle pills) and are unaffected.
 */
export const BORDER_RADIUS = 12;
