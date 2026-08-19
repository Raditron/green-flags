import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ThemeTokens } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "./AuthContext";
import type { ResendState } from "./interfaces";

/**
 * RN port of frontend's Layout/EmailVerificationBanner/EmailVerificationBanner.tsx: same
 * idle → sending → sent/error resend state machine, same "render nothing while loading, signed
 * out, or already verified" guard. Lives flat under auth/ rather than under components/, since
 * it's a cross-cutting piece rendered once at App.tsx root, in normal flex flow above
 * RootNavigator — unlike ThemeToggle/AccountControl, which live under components/Layout/ as
 * TopBar's own children, this has no per-screen safe-area padding of its own to account for.
 */
export function EmailVerificationBanner() {
  const { user, loading, resendVerificationEmail } = useAuth();
  const { tokens } = useTheme();
  const [resendState, setResendState] = useState<ResendState>("idle");
  const styles = getEmailVerificationBannerStyles(tokens);

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
    <View style={styles.banner}>
      <Text style={styles.text}>Email not verified.</Text>
      <Pressable
        onPress={handleResend}
        disabled={resendState === "sending"}
        accessibilityRole="button"
        style={styles.resendButton}
      >
        <Text style={styles.resendButtonText}>
          {resendState === "sent" ? "Verification email sent" : "Resend verification email"}
        </Text>
      </Pressable>
      {resendState === "error" && <Text style={styles.error}>Could not send email, try again.</Text>}
    </View>
  );
}

function getEmailVerificationBannerStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    banner: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 24,
      borderBottomWidth: 1,
      borderBottomColor: tokens.border,
    },
    text: {
      color: tokens.flagYellow,
      fontSize: 14,
    },
    resendButton: {
      borderWidth: 1,
      borderColor: tokens.border,
      borderRadius: 6,
      backgroundColor: tokens.surface,
      paddingVertical: 2,
      paddingHorizontal: 8,
    },
    resendButtonText: {
      color: tokens.text,
      fontSize: 13,
    },
    error: {
      color: tokens.error,
      fontSize: 14,
    },
  });
}
