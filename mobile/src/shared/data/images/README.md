# Beach hero photos

RN port of `frontend/src/shared/data/images/` — the curated per-beach photos BeachDetail's hero
image (#97) shows, falling back to a generic icon when a beach has none.

Mobile only ports the **hero** variant, not frontend's `card` variant. Frontend's list/card
thumbnail (the reason `card` exists at all) is explicitly out of scope for mobile's beach list —
see `BeachListCard.tsx`'s doc comment — so there's nothing on mobile that would ever render `card`.
Add it here (re-running the port script below) if a future ticket puts a photo thumbnail on the
mobile beach list.

Mobile also drops frontend's `width`/`height` metadata: the hero image always renders inside a
fixed-aspect-ratio box with `resizeMode: "cover"` (mirroring frontend's `object-fit: cover`), and
unlike a web `<img>`, RN's `<Image>` doesn't need the source's intrinsic size to lay out a box
that's already sized by its own style — see `BeachDetail.styles.ts`.

## Regenerating

`generated/` (the WebP files and `heroImages.ts`, the beachId -> `require()` map) is produced by
[`mobile/scripts/port-hero-images.mjs`](../../../../scripts/port-hero-images.mjs) from frontend's
already-built `frontend/src/shared/data/images/generated/manifest.ts` — mobile doesn't repeat
frontend's own source-photo -> WebP pipeline (`frontend/scripts/prepare-images.mjs`). Re-run it
whenever frontend's manifest changes:

```
node mobile/scripts/port-hero-images.mjs
```
