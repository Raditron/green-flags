import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { AuthModal } from "../Auth/AuthModal/AuthModal";
import { UserMenu } from "./UserMenu/UserMenu";
import { ToastProvider } from "./Toast/ToastContext";
import { ThemeProvider } from "./Theme/ThemeContext";
import { ThemeToggle } from "./Theme/ThemeToggle";
import { getLayoutStyles } from "./styles/Layout.styles";

export function Layout({ children }: { children: ReactNode }) {
  const { user, loading, resendVerificationEmail } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [resendState, setResendState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [isDashboardHovered, setIsDashboardHovered] = useState(false);
  const [isDashboardFocused, setIsDashboardFocused] = useState(false);
  const [isBeachesHovered, setIsBeachesHovered] = useState(false);
  const [isBeachesFocused, setIsBeachesFocused] = useState(false);
  const [isSavedHovered, setIsSavedHovered] = useState(false);
  const [isSavedFocused, setIsSavedFocused] = useState(false);
  const styles = getLayoutStyles({
    isDashboardHovered,
    isDashboardFocused,
    isBeachesHovered,
    isBeachesFocused,
    isSavedHovered,
    isSavedFocused,
  });

  async function handleResend() {
    setResendState("sending");
    try {
      await resendVerificationEmail();
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  }

  // Everything before the "@" — a first-name-style greeting without a separate display-name field.
  const greetingName = user?.email?.split("@")[0] ?? null;

  return (
    <ThemeProvider>
      <ToastProvider>
        <div style={styles.page}>
          <header style={styles.header}>
            <div style={styles.left}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Link to="/" style={styles.title}>
                  Green Flags
                </Link>
                {!loading && greetingName && (
                  <span style={styles.greeting}>Hello, {greetingName}</span>
                )}
              </div>
              <Link
                to="/"
                style={styles.dashboardLink}
                onMouseEnter={() => setIsDashboardHovered(true)}
                onMouseLeave={() => setIsDashboardHovered(false)}
                onFocus={() => setIsDashboardFocused(true)}
                onBlur={() => setIsDashboardFocused(false)}
              >
                Today
              </Link>
              <Link
                to="/beaches"
                style={styles.beachesLink}
                onMouseEnter={() => setIsBeachesHovered(true)}
                onMouseLeave={() => setIsBeachesHovered(false)}
                onFocus={() => setIsBeachesFocused(true)}
                onBlur={() => setIsBeachesFocused(false)}
              >
                All beaches
              </Link>
              {!loading && user && (
                <Link
                  to="/saved"
                  style={styles.savedLink}
                  onMouseEnter={() => setIsSavedHovered(true)}
                  onMouseLeave={() => setIsSavedHovered(false)}
                  onFocus={() => setIsSavedFocused(true)}
                  onBlur={() => setIsSavedFocused(false)}
                >
                  Your beaches
                </Link>
              )}
            </div>

            <div style={styles.right}>
              <ThemeToggle />
              {!loading &&
                (user ? (
                  <UserMenu email={user.email ?? ""} />
                ) : (
                  <button
                    type="button"
                    style={styles.signInButton}
                    onClick={() => setModalOpen(true)}
                  >
                    Sign in
                  </button>
                ))}
            </div>
          </header>

          {!loading && user && !user.emailVerified && (
            <div style={styles.verifyBanner}>
              Email not verified.{" "}
              <button
                type="button"
                style={styles.resendButton}
                onClick={handleResend}
                disabled={resendState === "sending"}
              >
                {resendState === "sent"
                  ? "Verification email sent"
                  : "Resend verification email"}
              </button>
              {resendState === "error" && (
                <span style={styles.error}>
                  {" "}
                  Could not send email, try again.
                </span>
              )}
            </div>
          )}

          {modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}

          <main style={styles.main}>{children}</main>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
