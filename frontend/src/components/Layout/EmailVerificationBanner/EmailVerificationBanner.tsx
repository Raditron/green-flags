import { useState } from "react";
import { useAuth } from "../../../auth/AuthContext";
import type { ResendState } from "./interfaces";
import { getEmailVerificationBannerStyles } from "./styles/EmailVerificationBanner.styles";

/**
 * "Email not verified" banner, including its own resend state machine
 * (idle → sending → sent/error). Self-contained the same way
 * SaveBeachButton reads its own context directly: it reads the signed-in
 * user off AuthContext itself and renders nothing once the user is
 * verified (or signed out), rather than Layout deciding when to mount it.
 */
export const EmailVerificationBanner = () => {
  const { user, loading, resendVerificationEmail } = useAuth();
  const [resendState, setResendState] = useState<ResendState>("idle");
  const styles = getEmailVerificationBannerStyles();

  async function handleResend() {
    setResendState("sending");
    try {
      await resendVerificationEmail();
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  }

  if (loading || !user || user.emailVerified) {
    return null;
  }

  return (
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
        <span style={styles.error}> Could not send email, try again.</span>
      )}
    </div>
  );
};
