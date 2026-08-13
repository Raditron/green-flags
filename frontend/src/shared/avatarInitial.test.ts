import { describe, expect, it } from "vitest";
import { avatarInitial } from "./avatarInitial";

describe("avatarInitial", () => {
  it("uses the uppercased displayName initial when displayName is present", () => {
    expect(avatarInitial("diver dan", "diver@example.com")).toBe("D");
  });

  it("falls back to the uppercased email initial when displayName is empty", () => {
    expect(avatarInitial("", "diver@example.com")).toBe("D");
  });

  it("falls back to \"?\" when both displayName and email are empty", () => {
    expect(avatarInitial("", "")).toBe("?");
  });
});
