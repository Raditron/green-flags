import { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";
import { logIn as logInData } from "./data/logIn";
import { logOut as logOutData } from "./data/logOut";
import { refreshEmailVerified as refreshEmailVerifiedData } from "./data/refreshEmailVerified";
import { resendVerificationEmail as resendVerificationEmailData } from "./data/resendVerificationEmail";
import { signUp as signUpData } from "./data/signUp";
import type { AuthContextValue, AuthProviderProps } from "./interfaces";

// RN port of frontend's auth/AuthContext.tsx: same shape (user/loading + the five actions), same
// AsyncStorage-backed session persistence handled by ../firebase.ts instead of localStorage. The
// Firebase calls themselves live in colocated data/ functions (see #94's "Data-layer tests"
// acceptance criterion) — this provider is the thin state/orchestration layer over them, and is
// itself the seam every auth-aware component mocks in its own tests (see EmailVerificationBanner,
// UserMenu, AuthScreen, AccountControl).
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  // Firebase caches the emailVerified claim on the client; clicking the verification link
  // elsewhere doesn't update it here until the ID token is force-refreshed. Re-check whenever the
  // app returns to the foreground so an unverified user doesn't stay stuck behind a stale claim —
  // the RN equivalent of frontend's window-focus listener (see frontend/src/auth/AuthContext.tsx).
  // Reads `auth.currentUser` (the SDK's live singleton) rather than the `user` state closed over
  // by this effect, since the effect only subscribes once and that closure would otherwise go
  // stale after the first render.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const current = auth.currentUser;
      if (nextAppState === "active" && current && !current.emailVerified) {
        void refreshEmailVerifiedData(current).then(setUser);
      }
    });
    return () => subscription.remove();
  }, []);

  async function signUp(email: string, password: string, displayName: string): Promise<void> {
    await signUpData(email, password, displayName);
  }

  async function logIn(email: string, password: string): Promise<void> {
    await logInData(email, password);
  }

  async function logOut(): Promise<void> {
    await logOutData();
  }

  async function resendVerificationEmail(): Promise<void> {
    if (!user) {
      throw new Error("Not signed in");
    }
    await resendVerificationEmailData(user);
  }

  async function refreshEmailVerified(): Promise<void> {
    if (!user) return;
    setUser(await refreshEmailVerifiedData(user));
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, logIn, logOut, resendVerificationEmail, refreshEmailVerified }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
