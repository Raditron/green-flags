// Single source of truth for "identify a user by one character": prefer their displayName, fall
// back to email, fall back to a placeholder. Used by both CommentSection's avatars and UserMenu's
// account chip so the two stay visually consistent — see issue #66.
export function avatarInitial(displayName: string, email: string): string {
  return displayName.charAt(0).toUpperCase() || email.charAt(0).toUpperCase() || "?";
}
