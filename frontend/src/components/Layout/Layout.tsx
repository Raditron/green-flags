import { useState } from "react";
import { Link } from "react-router-dom";
import { FaFlag } from "react-icons/fa6";
import { useAuth } from "../../auth/AuthContext";
import { AuthModal } from "../Auth/AuthModal/AuthModal";
import { UserMenu } from "./UserMenu/UserMenu";
import { ToastProvider } from "./Toast/ToastContext";
import { ThemeProvider } from "./Theme/ThemeContext";
import { ThemeToggle } from "./Theme/ThemeToggle";
import { NavLink } from "./NavLink/NavLink";
import { EmailVerificationBanner } from "./EmailVerificationBanner/EmailVerificationBanner";
import { useIsCompactHeader } from "./hooks/useIsCompactHeader";
import type { LayoutProps } from "./interfaces";
import { getLayoutStyles } from "./styles/Layout.styles";

export function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const isCompactHeader = useIsCompactHeader();
  const styles = getLayoutStyles();

  // Everything before the "@" — a first-name-style greeting without a separate display-name field.
  const greetingName = user?.email?.split("@")[0] ?? null;

  const titleBlock = (
    <div style={styles.titleBlock}>
      <Link to="/" style={styles.title}>
        <FaFlag style={styles.titleIcon} aria-hidden="true" />
        Green Flags
      </Link>
      {!loading && greetingName && <span style={styles.greeting}>Hello, {greetingName}</span>}
    </div>
  );

  // A single non-wrapping nav landmark — in both layouts, the pills move between rows as one
  // unit but can never split from each other internally (see Layout.styles.ts's navGroup).
  const navGroup = (
    <nav style={styles.navGroup} aria-label="Primary">
      <NavLink to="/beaches">All beaches</NavLink>
      {!loading && user && <NavLink to="/saved">Your beaches</NavLink>}
      <NavLink to="/">Today</NavLink>
    </nav>
  );

  const rightGroup = (
    <div style={styles.rightGroup}>
      <ThemeToggle />
      {!loading &&
        (user ? (
          <UserMenu email={user.email ?? ""} displayName={user.displayName ?? ""} />
        ) : (
          <button type="button" style={styles.signInButton} onClick={() => setModalOpen(true)}>
            Sign in
          </button>
        ))}
    </div>
  );

  return (
    <ThemeProvider>
      <ToastProvider>
        <div style={styles.page}>
          <header style={styles.header}>
            {isCompactHeader ? (
              <>
                <div style={styles.headerRowTop}>
                  {titleBlock}
                  {rightGroup}
                </div>
                <div style={styles.headerRowNav}>{navGroup}</div>
              </>
            ) : (
              <div style={styles.headerRowWide}>
                {titleBlock}
                {navGroup}
                {rightGroup}
              </div>
            )}
          </header>

          <EmailVerificationBanner />

          {modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}

          <main style={styles.main}>{children}</main>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
