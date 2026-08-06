import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { AuthModal } from "./AuthModal/AuthModal";
import { getAuthStatusStyles } from "./styles/AuthStatus.styles";

export function AuthStatus() {
  const { user, loading, logOut, resendVerificationEmail } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const styles = getAuthStatusStyles();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div style={styles.bar}>
        <button type="button" style={styles.signInButton} onClick={() => setModalOpen(true)}>
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
    <div style={styles.bar}>
      <span style={styles.email}>{user.email}</span>
      {!user.emailVerified && (
        <span style={styles.verifyBanner}>
          Email not verified.{" "}
          <button type="button" style={styles.resendButton} onClick={handleResend} disabled={resendState === "sending"}>
            {resendState === "sent" ? "Verification email sent" : "Resend verification email"}
          </button>
          {resendState === "error" && <span style={styles.error}> Could not send email, try again.</span>}
        </span>
      )}
      <button type="button" style={styles.logOutButton} onClick={() => logOut()}>
        Log out
      </button>
    </div>
  );
}
