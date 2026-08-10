export const colors = {
  blue: {
    chathamsBlue: "#134074",
    blueZodiac: "#13315c",
    downriver: "#0b2545",
    nepal: "#8da9c4",
  },
  snowDrift: "#eef4ed",
  // Neutral tokens for page/card surfaces, each a direct tint or
  // desaturation of one of the five brand colors above rather than an
  // independent color.
  neutrals: {
    // Monochromatic tint at the brand blues' shared ~211° hue, for the
    // light-mode page background. Replaces the former `linen` (a warm
    // beige off-hue from the rest of the palette) — renamed since "linen"
    // no longer describes a blue.
    seaHaze: "#eaf0f6",
    // Cool near-white tint of `nepal`, hue-tightened onto the shared ~211°
    // brand hue, for light-mode card surfaces.
    mistWhite: "#f8fafb",
    // Light tint of `nepal`, hue-tightened onto the shared ~211° brand hue,
    // for light-mode card borders.
    nepalMist: "#c1d1e1",
    // Muted, desaturated dark neutral derived from `downriver`, for the
    // dark-mode page background.
    duskSlate: "#1A1C22",
  },
};
