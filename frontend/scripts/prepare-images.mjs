#!/usr/bin/env node
/**
 * Beach photo pipeline (addresses issue #40).
 *
 * Build-time (not request-time) script that:
 *   1. Reads `src/shared/data/images/beach-photo-sources.ts` — the hand-maintained
 *      beachId -> raw source photo path map.
 *   2. SHA-256-hashes every referenced raw file and groups byte-identical files,
 *      keeping one canonical file per group and deleting the redundant copies
 *      (dedupe). Beach ids that pointed at a deleted duplicate are remapped to
 *      the group's canonical photo.
 *   3. Generates compressed WebP variants of each canonical photo, sized for the
 *      two places photos are actually rendered: the list/card thumbnail and the
 *      detail-page hero.
 *   4. Writes `src/shared/data/images/generated/manifest.ts`, mapping each beach
 *      id to its canonical photo key and each photo key to its card/hero variant
 *      files — the input `index.ts`'s responsive descriptor lookup consumes.
 *   5. Prints a before/after size report.
 *
 * Safe to re-run: `generated/` is wiped and rebuilt each time, and once
 * duplicates are deleted from disk a second run is a no-op for the dedupe step.
 *
 * Usage: npm run images:prepare (from frontend/)
 */
import { createHash } from "node:crypto";
import { readFile, writeFile, rm, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, "..", "src", "shared", "data", "images");
const SOURCES_FILE = path.join(IMAGES_DIR, "beach-photo-sources.ts");
const GENERATED_DIR = path.join(IMAGES_DIR, "generated");
const MANIFEST_FILE = path.join(GENERATED_DIR, "manifest.ts");

const CARD_SIZE = { width: 640, height: 346 }; // BeachListCard: 37/20 aspect ratio
const HERO_SIZE = { width: 1440, height: 600 }; // BeachDetail: 12/5 aspect ratio
const WEBP_QUALITY = 80;

/** Parses the hand-maintained beachId -> raw path map out of beach-photo-sources.ts. */
function parseBeachPhotoSources(sourceText) {
  const bodyMatch = sourceText.match(
    /BEACH_PHOTO_SOURCES:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\n\};/,
  );
  if (!bodyMatch) {
    throw new Error("Could not locate BEACH_PHOTO_SOURCES object body in beach-photo-sources.ts");
  }
  const body = bodyMatch[1];
  const entryPattern = /(?:"([^"]+)"|([A-Za-z][\w-]*))\s*:\s*"([^"]+)"/g;
  const entries = {};
  let match;
  while ((match = entryPattern.exec(body)) !== null) {
    const beachId = match[1] ?? match[2];
    const sourcePath = match[3];
    entries[beachId] = sourcePath;
  }
  return entries;
}

async function hashFile(absPath) {
  const buffer = await readFile(absPath);
  return createHash("sha256").update(buffer).digest("hex");
}

/** Strips the file extension, keeping the area/name shape (e.g. "shabla/durankulak"). */
function toPhotoKey(relPath) {
  const ext = path.extname(relPath);
  return relPath.slice(0, relPath.length - ext.length);
}

async function main() {
  const sourceText = await readFile(SOURCES_FILE, "utf8");
  const beachSources = parseBeachPhotoSources(sourceText);
  const beachIds = Object.keys(beachSources);
  const uniqueRelPaths = [...new Set(Object.values(beachSources))];

  console.log(`Read ${beachIds.length} beach ids, ${uniqueRelPaths.length} raw source files.`);

  // --- Dedupe: hash every raw file, group by content hash ---
  const hashToRelPaths = new Map();
  let beforeBytes = 0;
  for (const relPath of uniqueRelPaths) {
    const absPath = path.join(IMAGES_DIR, relPath);
    const [hash, { size }] = await Promise.all([hashFile(absPath), stat(absPath)]);
    beforeBytes += size;
    const group = hashToRelPaths.get(hash) ?? [];
    group.push(relPath);
    hashToRelPaths.set(hash, group);
  }

  const canonicalOf = new Map(); // relPath -> canonical relPath
  const duplicatesToDelete = [];
  for (const group of hashToRelPaths.values()) {
    const [canonical, ...duplicates] = [...group].sort();
    for (const relPath of group) canonicalOf.set(relPath, canonical);
    duplicatesToDelete.push(...duplicates);
  }

  for (const relPath of duplicatesToDelete) {
    await rm(path.join(IMAGES_DIR, relPath));
  }
  console.log(
    `Deduped: ${duplicatesToDelete.length} duplicate file(s) removed, ` +
      `${hashToRelPaths.size} canonical photo(s) remain.`,
  );

  // --- Remap beach ids to their canonical photo key ---
  const beachToPhotoKey = {};
  for (const beachId of beachIds) {
    const canonicalRelPath = canonicalOf.get(beachSources[beachId]);
    beachToPhotoKey[beachId] = toPhotoKey(canonicalRelPath);
  }

  const canonicalRelPaths = [...new Set(canonicalOf.values())];

  // --- Generate WebP variants ---
  await rm(GENERATED_DIR, { recursive: true, force: true });
  await mkdir(GENERATED_DIR, { recursive: true });

  const photos = {};
  let generatedBytes = 0;
  for (const relPath of canonicalRelPaths) {
    const photoKey = toPhotoKey(relPath);
    const absSourcePath = path.join(IMAGES_DIR, relPath);
    const outDir = path.join(GENERATED_DIR, path.dirname(relPath));
    await mkdir(outDir, { recursive: true });

    const baseName = path.basename(photoKey);
    const cardFile = `${path.dirname(relPath)}/${baseName}-card.webp`;
    const heroFile = `${path.dirname(relPath)}/${baseName}-hero.webp`;

    await sharp(absSourcePath)
      .rotate()
      .resize(CARD_SIZE.width, CARD_SIZE.height, { fit: "cover" })
      .webp({ quality: WEBP_QUALITY })
      .toFile(path.join(GENERATED_DIR, cardFile));
    await sharp(absSourcePath)
      .rotate()
      .resize(HERO_SIZE.width, HERO_SIZE.height, { fit: "cover" })
      .webp({ quality: WEBP_QUALITY })
      .toFile(path.join(GENERATED_DIR, heroFile));

    const [cardStat, heroStat] = await Promise.all([
      stat(path.join(GENERATED_DIR, cardFile)),
      stat(path.join(GENERATED_DIR, heroFile)),
    ]);
    generatedBytes += cardStat.size + heroStat.size;

    photos[photoKey] = {
      card: { file: cardFile, ...CARD_SIZE },
      hero: { file: heroFile, ...HERO_SIZE },
    };
  }

  // --- Write manifest.ts ---
  const manifestSource = `// GENERATED FILE — do not hand-edit. Produced by scripts/prepare-images.mjs
// from beach-photo-sources.ts. Run \`npm run images:prepare\` to regenerate.

export interface ManifestImageVariant {
  file: string;
  width: number;
  height: number;
}

export interface ManifestPhoto {
  card: ManifestImageVariant;
  hero: ManifestImageVariant;
}

export const BEACH_PHOTO_MANIFEST = {
  beaches: ${JSON.stringify(beachToPhotoKey, null, 2)} as Record<string, string>,
  photos: ${JSON.stringify(photos, null, 2)} as Record<string, ManifestPhoto>,
} as const;
`;
  await writeFile(MANIFEST_FILE, manifestSource, "utf8");

  // --- Report ---
  const afterBytes = (
    await Promise.all(canonicalRelPaths.map((p) => stat(path.join(IMAGES_DIR, p))))
  ).reduce((sum, s) => sum + s.size, 0);

  const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);
  console.log("");
  console.log("=== Beach photo pipeline report ===");
  console.log(`Raw sources before dedupe: ${uniqueRelPaths.length} files, ${mb(beforeBytes)} MB`);
  console.log(`Raw sources after dedupe:  ${canonicalRelPaths.length} files, ${mb(afterBytes)} MB`);
  console.log(`Generated WebP variants:   ${canonicalRelPaths.length * 2} files, ${mb(generatedBytes)} MB`);
  console.log(
    `Total shipped-image footprint change: ${mb(beforeBytes)} MB raw -> ${mb(generatedBytes)} MB compressed`,
  );
  console.log("====================================");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
