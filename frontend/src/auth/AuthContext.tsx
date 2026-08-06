import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp(email: string, password: string): Promise<void>;
  logIn(email: string, password: string): Promise<void>;
  logOut(): Promise<void>;
  resendVerificationEmail(): Promise<void>;
  refreshEmailVerified(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  // Firebase caches the emailVerified claim on the client; clicking the verification link in
  // another tab doesn't update it here until the ID token is force-refreshed. Re-check whenever
  // the tab regains focus so an unverified user doesn't stay stuck behind a stale claim.
  useEffect(() => {
    function handleFocus() {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        void refreshEmailVerified();
      }
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  async function refreshEmailVerified(): Promise<void> {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    // reload() mutates the existing User instance in place, so a plain copy is needed to give
    // React a new object reference to detect the change.
    setUser({ ...auth.currentUser } as User);
  }

  async function signUp(email: string, password: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(credential.user);
  }

  async function logIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logOut(): Promise<void> {
    await signOut(auth);
  }

  async function resendVerificationEmail(): Promise<void> {
    if (!auth.currentUser) {
      throw new Error("Not signed in");
    }
    await sendEmailVerification(auth.currentUser);
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
