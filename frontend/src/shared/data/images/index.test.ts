import { describe, expect, it } from "vitest";
import { getBeachImage } from "./index";
import { BEACH_PHOTO_MANIFEST } from "./generated/manifest";

describe("getBeachImage", () => {
  it("returns a responsive descriptor with card and hero variants for a known beach id", () => {
    const descriptor = getBeachImage("varna-central-beach");

    expect(descriptor).toBeDefined();
    expect(descriptor?.card).toMatchObject({ width: 640, height: 346 });
    expect(descriptor?.card.src).toEqual(expect.any(String));
    expect(descriptor?.hero).toMatchObject({ width: 1440, height: 600 });
    expect(descriptor?.hero.src).toEqual(expect.any(String));
  });

  it("returns undefined for an unknown beach id", () => {
    expect(getBeachImage("not-a-real-beach")).toBeUndefined();
  });

  it("resolves every beach id declared in the manifest", () => {
    for (const beachId of Object.keys(BEACH_PHOTO_MANIFEST.beaches)) {
      expect(getBeachImage(beachId)).toBeDefined();
    }
  });

  it("resolves area-fallback beach ids sharing a photo to the same canonical descriptor", () => {
    // durankulak-north-1 and durankulak-north-2 intentionally share one
    // representative photo (see beach-photo-sources.ts / IMAGE_SOURCES.md).
    const a = getBeachImage("durankulak-north-1");
    const b = getBeachImage("durankulak-north-2");

    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(a?.card.src).toEqual(b?.card.src);
    expect(a?.hero.src).toEqual(b?.hero.src);
  });

  it("keeps beach ids that resolve to distinct photos apart", () => {
    const varna = getBeachImage("varna-central-beach");
    const goldenSands = getBeachImage("golden-sands");

    expect(varna?.card.src).not.toEqual(goldenSands?.card.src);
  });
});
