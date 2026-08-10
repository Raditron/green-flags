# Light-mode neutrals are blue tints of the brand hue, and theme switching is an explicit override over `prefers-color-scheme`, not a replacement for it

The site already renders both a light and a dark theme, but only ever by following the browser's
`prefers-color-scheme` — visitors had no in-app way to pick one regardless of their OS setting.
Separately, light mode's neutral tokens (`linen` for the page background, in particular) were a
warm beige, off-hue from the brand blues (Chatham's Blue, Blue Zodiac, Downriver, Nepal) that
cluster at roughly the same 209–215° hue and that dark mode is already built from — so light mode
didn't read as the same "sea" identity as dark mode.

## Palette: monochromatic blue tints, not a new hue

We recolored the three light-mode neutral tokens as tints of that same shared ~211° hue, varying
only lightness/saturation:

- `neutrals.linen` → renamed to `neutrals.seaHaze` (`#f2eee2` → `#eaf0f6`) — renamed because
  "linen" describes a beige, and the token no longer is one.
- `neutrals.mistWhite` (`#f9fbfc` → `#f8fafb`) — kept its name; it was already blue-leaning, just
  nudged onto the exact shared hue.
- `neutrals.nepalMist` (`#ccd8e4` → `#c1d1e1`) — kept its name, likewise hue-tightened.

Text tokens (`chathamsBlue` for `--text`, `downriver` for `--text-h`) were already correctly blue
and are unchanged, as is everything about the dark theme and `colors.blue`. We kept the existing
convention of hand-mirroring `colors.ts` hex values into `index.css` custom properties with a
comment noting the source token, rather than building tooling to generate one from the other —
consistent with the file's current size and update frequency.

## Theme resolution: explicit override wins, else system

Rather than adding a persisted three-way choice (light / dark / "match system"), the toggle is a
two-way light/dark switch; the only way to get "match system" behavior is to never have toggled.
The rule is "if a stored preference exists, use it; otherwise follow `prefers-color-scheme`" —
expressed as a single pure function (`Theme/resolveTheme.ts`) taking the stored preference
(`"light" | "dark" | null`) and the OS's dark-mode match, returning the resolved theme. Keeping
that one decision decoupled from the DOM and React is the seam worth protecting here, even without
a test runner behind it yet (the frontend has none — see the ticket's Testing Decisions).

We store only `"light"` or `"dark"` under a single `localStorage` key, never a "no preference"
sentinel — the key's *absence* means "no explicit choice yet, follow system", so the resolved theme
and the "has the visitor explicitly chosen" flag collapse into one piece of state instead of two
that could disagree.

The resolved theme is reflected as `data-theme="light" | "dark"` on `<html>`. `index.css` keeps its
existing `:root { … }` block as the light defaults and its existing
`@media (prefers-color-scheme: dark)` block as the automatic fallback, but that block is now scoped
to `:root:not([data-theme])` so an explicit `data-theme` always wins regardless of the OS setting or
cascade order. `:root[data-theme="dark"]` mirrors the media query's values (unavoidable duplication
under the hand-mirrored convention above); `:root[data-theme="light"]` only needs a `color-scheme`
override, since its variable values already equal the `:root` defaults.

A first-time visitor (no stored key) still resolves purely from `prefers-color-scheme` via CSS —
`ThemeProvider` mirrors the same resolved value into `data-theme` on mount for the toggle button's
icon and for `color-scheme`, but that mirroring never touches `localStorage`, so "explicit choice"
still means "the visitor pressed the button," not "the app happened to render an attribute."

## Flash prevention

A blocking inline `<script>` in `index.html`, before the app mounts, reads the `localStorage` key
and sets `data-theme` on `<html>` synchronously if present. No stored choice → it leaves the
attribute unset and lets the CSS media-query fallback render correctly for first paint, without
needing to duplicate `resolveTheme`'s logic (or a `matchMedia` call) into that pre-mount script.

## State ownership and placement

Theme state (read/write `localStorage`, the toggle function) is owned by `ThemeContext`, provided
at the `Layout` level — the same pattern as `ToastContext`, and consistent with
[ADR 0003](0003-toast-notifications-owned-by-layout.md)'s precedent that `Layout` owns cross-page
chrome rather than pages managing it themselves. The toggle button is icon-only (sun/moon swapping
with the theme a click would switch *to*), placed as the first element in `Layout`'s header
right-hand group, before sign-in/`UserMenu`, styled after `UserMenu`'s circular chip rather than the
pill-link nav treatment.

## Rejected alternatives

- **A three-way light/dark/system toggle** — rejected as unnecessary complexity; a visitor who
  wants "system" behavior gets it by simply never touching the toggle.
- **Auto-generating `index.css` from `colors.ts`** — rejected for the same reason the existing code
  doesn't already do this: not enough tokens or churn to justify the tooling yet.
