import { StyleSheet } from "react-native";
import { BORDER_RADIUS } from "../../../theme/tokens";
import type { ThemeTokens } from "../../../theme/tokens";

/**
 * RN port of frontend's SavedBeaches.styles.ts's `title`, plus the message/error/empty treatment
 * `getBeachListStyles` already supplies elsewhere (borrowed the same way frontend's own
 * getSavedBeachesGridStyles does) and a sign-in-prompt block (#100) with no frontend counterpart —
 * frontend redirects a signed-out visitor straight to the Dashboard instead of prompting in place
 * (see #23's Implementation Decisions), but #91's mobile parity spec asks for an in-tab prompt
 * (story 29) so a visitor who taps the always-visible Saved tab understands why it's empty rather
 * than the tab just not existing.
 */
export function getSavedBeachesStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.bg,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: tokens.textHeading,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    message: {
      fontSize: 15,
      color: tokens.text,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    error: {
      fontSize: 15,
      color: tokens.error,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    signInPrompt: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 32,
      paddingBottom: 48,
    },
    signInHeadline: {
      fontSize: 17,
      fontWeight: "700",
      color: tokens.textHeading,
      textAlign: "center",
    },
    signInBody: {
      fontSize: 14,
      lineHeight: 20,
      color: tokens.text,
      opacity: 0.85,
      textAlign: "center",
    },
    signInButton: {
      marginTop: 6,
      borderRadius: BORDER_RADIUS,
      borderWidth: 1,
      borderColor: tokens.border,
      backgroundColor: tokens.surface,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    signInButtonText: {
      color: tokens.text,
      fontSize: 15,
      fontWeight: "700",
    },
  });
}
