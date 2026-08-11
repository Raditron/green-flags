const ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_ID_LENGTH = 128;

/**
 * True for a well-formed id: a non-empty string of letters, digits, hyphens, and underscores, no
 * longer than 128 characters. Every id in this system fits this shape — beach slugs (e.g.
 * "kranevo-sunny-day", see beachSeedData.ts) and Firebase UIDs alike — even though none of them
 * are actual MongoDB ObjectIds; beach documents key on their slug as `_id` directly rather than a
 * generated ObjectId (see mongoBeachRepository.ts). Centralizing the check here means route params
 * and body fields get validated the same way everywhere instead of being passed through as
 * unchecked `string`.
 */
export function isValidId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_ID_LENGTH &&
    ID_PATTERN.test(value)
  );
}
