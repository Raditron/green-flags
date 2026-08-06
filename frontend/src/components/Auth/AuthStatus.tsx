import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { AuthModal } from "./AuthModal/AuthModal";
import styles from "./styles/AuthStatus.module.css";

export function AuthStatus() {
  const { user, loading, logOut, resendVerificationEmail } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className={styles.bar}>
        <button type="button" className={styles.signInButton} onClick={() => setModalOpen(true)}>
          Sign in
        </button>
        {modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}
      </div>
    );
  }

  async function handleResend() {
    setResendState("sending");
    try {
      await resendVerificationEmail();
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  }

  return (
    <div className={styles.bar}>
      <span className={styles.email}>{user.email}</span>
      {!user.emailVerified && (
        <span className={styles.verifyBanner}>
          Email not verified.{" "}
          <button type="button" className={styles.resendButton} onClick={handleResend} disabled={resendState === "sending"}>
            {resendState === "sent" ? "Verification email sent" : "Resend verification email"}
          </button>
          {resendState === "error" && <span className={styles.error}> Could not send email, try again.</span>}
        </span>
      )}
      <button type="button" className={styles.logOutButton} onClick={() => logOut()}>
        Log out
      </button>
    </div>
  );
}
