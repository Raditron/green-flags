import { describe, expect, it } from "vitest";
import { isValidId } from "../../../src/domain/shared/id";

describe("isValidId", () => {
  it("accepts a beach slug", () => {
    expect(isValidId("kranevo-sunny-day")).toBe(true);
  });

  it("accepts a Firebase-style UID", () => {
    expect(isValidId("aB3xQz9Lm0pR7sT2uV4wYz6C")).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(isValidId("")).toBe(false);
  });

  it("rejects non-string values", () => {
    expect(isValidId(undefined)).toBe(false);
    expect(isValidId(null)).toBe(false);
    expect(isValidId(123)).toBe(false);
    expect(isValidId({ beachId: "kavarna" })).toBe(false);
  });

  it("rejects ids containing characters outside letters, digits, hyphens, and underscores", () => {
    expect(isValidId("kavarna/../etc")).toBe(false);
    expect(isValidId("kavarna beach")).toBe(false);
    expect(isValidId("$where")).toBe(false);
  });

  it("rejects an id longer than 128 characters", () => {
    expect(isValidId("a".repeat(129))).toBe(false);
  });

  it("accepts an id at exactly the 128 character limit", () => {
    expect(isValidId("a".repeat(128))).toBe(true);
  });
});
