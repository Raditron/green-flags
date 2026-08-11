import { BEACH_PHOTO_MANIFEST } from "./generated/manifest";

/**
 * Responsive descriptor lookup for curated beach photos, keyed by beach id —
 * the stable slug used for routing and in the backend seed data
 * (backend/src/infrastructure/seed/beachSeedData.ts and
 * unguardedBeachSeedData.ts), as opposed to the human-readable `name` field.
 *
 * The underlying photos are prepared ahead of time by
 * `frontend/scripts/prepare-images.mjs` (source of truth for which raw file
 * maps to which beach id: `beach-photo-sources.ts`), which dedupes
 * byte-identical source photos and generates compressed WebP variants sized
 * for the two places a photo is actually rendered: the list/card thumbnail
 * and the detail-page hero. `generated/manifest.ts` (fully generated — do
 * not hand-edit) records the resulting beachId -> canonical photo ->
 * {card, hero} variant mapping; this file glues that manifest to the actual
 * built asset URLs via `import.meta.glob`.
 *
 * Beach ids that intentionally share one representative "area fallback"
 * photo (see IMAGE_SOURCES.md) resolve to the same canonical descriptor,
 * since they share the same manifest photo key.
 */

export interface ResponsiveImageVariant {
  src: string;
  width: number;
  height: number;
}

export interface ResponsiveImageDescriptor {
  card: ResponsiveImageVariant;
  hero: ResponsiveImageVariant;
}

// Eagerly import every generated WebP variant's URL, keyed by its path
// relative to this file (e.g. "./generated/shabla/durankulak-card.webp").
// Only the small generated variants are ever imported here — the raw,
// multi-MB source photos under the area directories are pipeline input
// only and are never bundled.
const cardUrls = import.meta.glob<string>("./generated/**/*-card.webp", {
  eager: true,
  import: "default",
});
const heroUrls = import.meta.glob<string>("./generated/**/*-hero.webp", {
  eager: true,
  import: "default",
});

function resolveVariant(
  urls: Record<string, string>,
  file: string,
  width: number,
  height: number,
): ResponsiveImageVariant {
  const key = `./generated/${file}`;
  const src = urls[key];
  if (!src) {
    throw new Error(
      `Beach image pipeline output missing for "${file}" — run "npm run images:prepare".`,
    );
  }
  return { src, width, height };
}

export const BEACH_IMAGES: Record<string, ResponsiveImageDescriptor> = Object.fromEntries(
  Object.entries(BEACH_PHOTO_MANIFEST.beaches).map(([beachId, photoKey]) => {
    const photo = BEACH_PHOTO_MANIFEST.photos[photoKey as keyof typeof BEACH_PHOTO_MANIFEST.photos];
    const descriptor: ResponsiveImageDescriptor = {
      card: resolveVariant(cardUrls, photo.card.file, photo.card.width, photo.card.height),
      hero: resolveVariant(heroUrls, photo.hero.file, photo.hero.width, photo.hero.height),
    };
    return [beachId, descriptor];
  }),
);

export function getBeachImage(beachId: string): ResponsiveImageDescriptor | undefined {
  return BEACH_IMAGES[beachId];
}
