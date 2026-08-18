import type { User } from "firebase/auth";
import type { ReactNode } from "react";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp(email: string, password: string, displayName: string): Promise<void>;
  logIn(email: string, password: string): Promise<void>;
  logOut(): Promise<void>;
  resendVerificationEmail(): Promise<void>;
  refreshEmailVerified(): Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

// Mirrors frontend's Layout/EmailVerificationBanner/interfaces/index.ts.
export type ResendState = "idle" | "sending" | "sent" | "error";

// Mirrors frontend's Layout/UserMenu/interfaces/index.ts.
export interface UserMenuProps {
  email: string;
  // Firebase's `User.displayName` is `string | null`; callers coalesce it to `""` before
  // passing it down, same as frontend does.
  displayName: string;
}

// Mirrors frontend's Auth/AuthModal/interfaces/index.ts.
export type AuthFormMode = "login" | "signup";

export interface AuthScreenProps {
  onClose(): void;
  /** Fired instead of onClose after a successful sign-in/sign-up, so a caller that needs to tell
   * "closed because it succeeded" apart from "closed because it was cancelled" can do so — the
   * AuthContext's user only updates asynchronously, so that distinction can't be inferred from
   * watching `user` alone. Falls back to onClose when omitted (matches frontend). */
  onAuthenticated?(): void;
}
