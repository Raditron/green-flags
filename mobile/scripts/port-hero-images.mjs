#!/usr/bin/env node
// Ports frontend's curated beach hero photos into mobile.
//
// frontend/scripts/prepare-images.mjs is the actual image pipeline (source photo -> compressed,
// sized WebP variants) — mobile doesn't repeat that pipeline. This script instead reads its
// *output*, frontend/src/shared/data/images/generated/manifest.ts, and:
//   1. copies every hero WebP variant (card variants are frontend-only — see
//      mobile/src/shared/data/images/README.md) into mobile/src/shared/data/images/generated/,
//      preserving frontend's per-area subdirectories so both trees stay diffable by eye;
//   2. writes generated/heroImages.ts, a flat beachId -> require(heroFile) map that resolves the
//      manifest's beachId -> photo-key -> hero-file indirection ahead of time, since Metro's
//      require() calls must be static string literals rather than runtime-computed paths.
//
// Re-run whenever frontend's manifest changes (new beaches, re-cropped photos, etc.):
//   node mobile/scripts/port-hero-images.mjs

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MOBILE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const REPO_ROOT = dirname(MOBILE_ROOT);
const FRONTEND_MANIFEST = join(REPO_ROOT, "frontend/src/shared/data/images/generated/manifest.ts");
const SRC_ROOT = join(REPO_ROOT, "frontend/src/shared/data/images/generated");
const DEST_ROOT = join(MOBILE_ROOT, "src/shared/data/images/generated");

function parseManifest(source) {
  const marker = "export const BEACH_PHOTO_MANIFEST = ";
  const start = source.indexOf(marker) + marker.length;
  if (start < marker.length) throw new Error("BEACH_PHOTO_MANIFEST not found in manifest.ts");

  // Brace-counting rather than a regex: the object literal nests nine `photos.<key>` sub-objects,
  // so a shallow regex can't tell an inner "};"-shaped close from the outer one.
  let depth = 0;
  let end = -1;
  for (let i = start; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) throw new Error("Could not find the end of BEACH_PHOTO_MANIFEST's object literal");

  // The object literal is otherwise plain JS (quoted string keys/values) — only the two inline
  // `as Record<...>` type casts need stripping before it's valid to eval.
  const body = source.slice(start, end + 1).replace(/ as Record<[^;]*?>(?=,|\n|\})/g, "");
  // eslint-disable-next-line no-eval -- trusted, repo-local generated file, not user input.
  return eval(`(${body})`);
}

const manifest = parseManifest(readFileSync(FRONTEND_MANIFEST, "utf8"));

const heroFiles = new Set(Object.values(manifest.photos).map((photo) => photo.hero.file));
for (const file of heroFiles) {
  const dest = join(DEST_ROOT, file);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(join(SRC_ROOT, file), dest);
}

const beachIds = Object.keys(manifest.beaches).sort();
const entries = beachIds
  .map((beachId) => `  "${beachId}": require("./${manifest.photos[manifest.beaches[beachId]].hero.file}"),`)
  .join("\n");

const header = `// GENERATED FILE — do not hand-edit. Produced by mobile/scripts/port-hero-images.mjs from
// frontend/src/shared/data/images/generated/manifest.ts. Run
// "node mobile/scripts/port-hero-images.mjs" (from the repo root) to regenerate.
//
// Maps each beach id straight to its hero WebP asset module, resolving the manifest's
// beachId -> photo-key -> hero-file indirection (including beach ids that intentionally share one
// representative photo, e.g. durankulak-north-1/-2 — see frontend's IMAGE_SOURCES.md) ahead of
// time, since Metro's require() calls must be static string literals, not runtime-computed paths.
export const HERO_IMAGES: Record<string, ReturnType<typeof require>> = {
${entries}
};
`;

writeFileSync(join(DEST_ROOT, "heroImages.ts"), header);

console.log(`Copied ${heroFiles.size} hero images and wrote heroImages.ts with ${beachIds.length} entries.`);
