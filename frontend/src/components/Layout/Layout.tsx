import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { AuthModal } from "../Auth/AuthModal/AuthModal";
import { UserMenu } from "./UserMenu/UserMenu";
import { ToastProvider } from "./Toast/ToastContext";
import { ThemeProvider } from "./Theme/ThemeContext";
import { ThemeToggle } from "./Theme/ThemeToggle";
import { NavLink } from "./NavLink/NavLink";
import { EmailVerificationBanner } from "./EmailVerificationBanner/EmailVerificationBanner";
import type { LayoutProps } from "./interfaces";
import { getLayoutStyles } from "./styles/Layout.styles";

export function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const styles = getLayoutStyles();

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
              <NavLink to="/beaches">All beaches</NavLink>
              {!loading && user && <NavLink to="/saved">Your beaches</NavLink>}
              <NavLink to="/">Today</NavLink>
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

          <EmailVerificationBanner />

          {modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}

          <main style={styles.main}>{children}</main>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
