// Single source of truth for "identify a user by one character": prefer their displayName, fall
// back to email, fall back to a placeholder. Mirrors frontend/src/shared/avatarInitial.ts — used
// by UserMenu's account chip, same as frontend's UserMenu.
export function avatarInitial(displayName: string, email: string): string {
  return displayName.charAt(0).toUpperCase() || email.charAt(0).toUpperCase() || "?";
}
