import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../../auth/AuthContext";
import type { AuthFormMode, AuthModalProps } from "./interfaces";
import { getAuthModalStyles } from "./styles/AuthModal.styles";

export function AuthModal({ onClose, onAuthenticated }: AuthModalProps) {
  const { signUp, logIn } = useAuth();
  const [mode, setMode] = useState<AuthFormMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const styles = getAuthModalStyles({ submitting });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, displayName);
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
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
        <h2 style={styles.title}>{mode === "signup" ? "Create an account" : "Sign in"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "signup" && (
            <label style={styles.label}>
              Display name
              <input
                type="text"
                required
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                style={styles.input}
              />
            </label>
          )}
          <label style={styles.label}>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={styles.input}
            />
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={submitting} style={styles.submit}>
            {mode === "signup" ? "Sign up" : "Log in"}
          </button>
        </form>

        <button
          type="button"
          style={styles.toggle}
          onClick={() => {
            setError(null);
            setMode(mode === "signup" ? "login" : "signup");
          }}
        >
          {mode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
        </button>

        <button type="button" style={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
    </div>
  );
}
