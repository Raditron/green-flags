import { resolveTheme } from "./resolveTheme";

describe("resolveTheme", () => {
  it("returns the stored choice when one exists, regardless of the OS preference", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("falls back to the OS preference when there is no stored choice", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });
});
