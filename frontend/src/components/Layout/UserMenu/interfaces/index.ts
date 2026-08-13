export interface UserMenuProps {
  email: string;
  // Matches how `email` is already modeled here: Firebase's `User.displayName` is
  // `string | null`, but Layout coalesces it to `""` before passing it down.
  displayName: string;
}
