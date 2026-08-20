import { getBeachHeroImage } from "./index";
import { HERO_IMAGES } from "./generated/heroImages";

// jest-expo stubs every image asset's require() to the same literal (see
// assetFileTransformer.js), so — unlike frontend's equivalent test — there's no way to assert two
// different beach ids resolve to two different underlying files from inside a test. What's left
// worth asserting is the map's own shape: every generated beachId key actually resolves, and an
// unknown id falls back to undefined so BeachDetail renders its generic icon instead.
describe("getBeachHeroImage", () => {
  it("returns a defined asset module for a known beach id", () => {
    expect(getBeachHeroImage("varna-central-beach")).toBeDefined();
  });

  it("returns undefined for an unknown beach id", () => {
    expect(getBeachHeroImage("not-a-real-beach")).toBeUndefined();
  });

  it("resolves every beach id generated into the map", () => {
    for (const beachId of Object.keys(HERO_IMAGES)) {
      expect(getBeachHeroImage(beachId)).toBeDefined();
    }
  });
});
