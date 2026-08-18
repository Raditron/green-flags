// RN stand-ins for CSS Color 4's `color-mix(in srgb, ...)`, which frontend uses throughout its
// theme-token-derived colors and RN has no equivalent for. Both take "#RRGGBB" theme-token colors
// (see theme/tokens.ts) — never arbitrary CSS color syntax, so no general-purpose parser is needed.
function channelsOf(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/** `color-mix(in srgb, hexA aPercent%, hexB)` — blends two opaque colors. */
export function mixHex(hexA: string, hexB: string, aPercent: number): string {
  const [ar, ag, ab] = channelsOf(hexA);
  const [br, bg, bb] = channelsOf(hexB);
  const ratio = aPercent / 100;
  const mix = (a: number, b: number) =>
    Math.round(a * ratio + b * (1 - ratio))
      .toString(16)
      .padStart(2, "0");
  return `#${mix(ar, br)}${mix(ag, bg)}${mix(ab, bb)}`;
}

/** `color-mix(in srgb, hex percent%, transparent)` — reduces to `percent`% opacity, expressed as
 * an rgba() string since RN has no `color-mix`/`transparent` keyword to lean on. */
export function hexToRgba(hex: string, percent: number): string {
  const [r, g, b] = channelsOf(hex);
  return `rgba(${r}, ${g}, ${b}, ${percent / 100})`;
}
