import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FaEye, FaEyeSlash, FaFlag, FaTriangleExclamation } from "react-icons/fa6";
import { useAuth } from "../../../auth/AuthContext";
import type { AuthFormMode, AuthModalProps } from "./interfaces";
import { getAuthInputStyle, getAuthModalStyles, getAuthSegmentTabStyle } from "./styles/AuthModal.styles";

type FocusableField = "displayName" | "email" | "password" | null;

export function AuthModal({ onClose, onAuthenticated }: AuthModalProps) {
  const { signUp, logIn } = useAuth();
  const [mode, setMode] = useState<AuthFormMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusableField>(null);
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  // Starts false so the first paint renders the card in its pre-transition (offset/transparent)
  // state, then flips a tick later — flipping it true synchronously would collapse the CSS
  // transition into a single already-settled frame instead of animating.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const styles = getAuthModalStyles({ submitting, mounted, isCloseHovered, isSubmitHovered });

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

  function switchMode(nextMode: AuthFormMode) {
    if (nextMode === mode) return;
    setError(null);
    setMode(nextMode);
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          style={styles.close}
          onClick={onClose}
          onMouseEnter={() => setIsCloseHovered(true)}
          onMouseLeave={() => setIsCloseHovered(false)}
          aria-label="Close"
        >
          ×
        </button>

        <p style={styles.kicker}>
          <FaFlag style={styles.kickerIcon} aria-hidden="true" />
          Green Flags
        </p>
        <h2 style={styles.title}>{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
        <p style={styles.subtitle}>
          {mode === "signup"
            ? "Join to save beaches and get today's flag calls at a glance."
            : "Sign in to check today's flag and manage your saved beaches."}
        </p>

        {/* Segmented tab switcher rather than a plain link — the two modes read as equal, adjacent
            choices. Rendered as `tab`s (not `button`s) so their accessible name doesn't collide
            with the submit button below, which reuses the same "Sign up"/"Log in" label. */}
        <div role="tablist" aria-label="Sign in or sign up" style={styles.segment}>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            style={getAuthSegmentTabStyle({ active: mode === "login" })}
            onClick={() => switchMode("login")}
          >
            Log in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            style={getAuthSegmentTabStyle({ active: mode === "signup" })}
            onClick={() => switchMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "signup" && (
            <div style={styles.field}>
              <label htmlFor="auth-display-name" style={styles.label}>
                Display name
              </label>
              <input
                id="auth-display-name"
                type="text"
                required
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                onFocus={() => setFocusedField("displayName")}
                onBlur={() => setFocusedField(null)}
                style={getAuthInputStyle({ focused: focusedField === "displayName", hasTrailingIcon: false })}
              />
            </div>
          )}

          <div style={styles.field}>
            <label htmlFor="auth-email" style={styles.label}>
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              style={getAuthInputStyle({ focused: focusedField === "email", hasTrailingIcon: false })}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="auth-password" style={styles.label}>
              Password
            </label>
            <div style={styles.inputWrapper}>
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                style={getAuthInputStyle({ focused: focusedField === "password", hasTrailingIcon: true })}
              />
              <button
                type="button"
                style={styles.eyeButton}
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorBanner} role="alert">
              <FaTriangleExclamation style={styles.errorIcon} aria-hidden="true" />
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={styles.submit}
            onMouseEnter={() => setIsSubmitHovered(true)}
            onMouseLeave={() => setIsSubmitHovered(false)}
          >
            {submitting ? "One moment…" : mode === "signup" ? "Sign up" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
