import { HERO_IMAGES } from "./generated/heroImages";

/**
 * A beach's curated hero photo, ready to hand straight to `<Image source={...} />` — or
 * `undefined` for a beach with none, so BeachDetail can fall back to its generic icon. See
 * README.md for how this differs from frontend's `getBeachImage` (hero only, no width/height).
 */
export function getBeachHeroImage(beachId: string): ReturnType<typeof require> | undefined {
  return HERO_IMAGES[beachId];
}
