export type AuthFormMode = "login" | "signup";

export interface AuthModalProps {
  onClose: () => void;
  /** Fired instead of onClose after a successful sign-in/sign-up, so a caller that needs to tell
   * "closed because it succeeded" apart from "closed because it was cancelled" can do so — the
   * AuthContext's user only updates asynchronously, so that distinction can't be inferred from
   * watching `user` alone. Falls back to onClose when omitted (existing callers' behavior). */
  onAuthenticated?: () => void;
}
