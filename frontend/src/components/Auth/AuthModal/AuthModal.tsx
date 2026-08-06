import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../../auth/AuthContext";
import type { AuthFormMode } from "./interfaces";
import styles from "./styles/AuthModal.module.css";

interface AuthModalProps {
  onClose: () => void;
  /** Fired instead of onClose after a successful sign-in/sign-up, so a caller that needs to tell
   * "closed because it succeeded" apart from "closed because it was cancelled" can do so — the
   * AuthContext's user only updates asynchronously, so that distinction can't be inferred from
   * watching `user` alone. Falls back to onClose when omitted (existing callers' behavior). */
  onAuthenticated?: () => void;
}

export function AuthModal({ onClose, onAuthenticated }: AuthModalProps) {
  const { signUp, logIn } = useAuth();
  const [mode, setMode] = useState<AuthFormMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
      } else {
        await logIn(email, password);
      }
      if (onAuthenticated) {
        onAuthenticated();
      } else {
        onClose();
      }
    } catch {
      setError(mode === "signup" ? "Could not create account. Try a different email." : "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <h2 className={styles.title}>{mode === "signup" ? "Create an account" : "Sign in"}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={styles.input}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={submitting} className={styles.submit}>
            {mode === "signup" ? "Sign up" : "Log in"}
          </button>
        </form>

        <button
          type="button"
          className={styles.toggle}
          onClick={() => {
            setError(null);
            setMode(mode === "signup" ? "login" : "signup");
          }}
        >
          {mode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
        </button>

        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
    </div>
  );
}
