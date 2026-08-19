import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ThemeTokens } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeContext";
import { AuthScreen } from "../../auth/AuthScreen";
import { useAuth } from "../../auth/AuthContext";
import { UserMenu } from "../../auth/UserMenu";

/**
 * RN port of frontend's Layout.tsx `rightGroup` (the `UserMenu`/"Sign in" half of it — ThemeToggle
 * is the other half), plus its `titleBlock`'s `greetingName` span — mobile's title area (TopBar's
 * `titleBlock`) holds only the wordmark, with no greeting slot of its own, so the greeting stays
 * folded in alongside UserMenu here instead, using the same "everything before the @" derivation
 * as frontend's `greetingName`. Rendered inside TopBar
 * (`components/Layout/TopBar.tsx`), which supplies the header bar's background/border and safe-area
 * top padding — this component only lays out its own row content, it doesn't position itself on
 * screen. While signed out, owns the local `authScreenOpen` state that frontend's Layout keeps as
 * `modalOpen`, opening AuthScreen the same way Layout opens AuthModal.
 */
export function AccountControl() {
  const { user, loading } = useAuth();
  const { tokens } = useTheme();
  const [authScreenOpen, setAuthScreenOpen] = useState(false);
  const styles = getAccountControlStyles(tokens);

  if (loading) {
    return null;
  }

  // Everything before the "@" — mirrors frontend's Layout.tsx `greetingName`, the "email shown in
  // the app's navigation" half of #94's acceptance criteria (UserMenu's chip is initials-only, on
  // both platforms).
  const greetingName = user?.email?.split("@")[0] ?? null;

  return (
    <View style={styles.container}>
      {user ? (
        <>
          {greetingName && <Text style={styles.greeting}>Hello, {greetingName}</Text>}
          <UserMenu email={user.email ?? ""} displayName={user.displayName ?? ""} />
        </>
      ) : (
        <Pressable
          onPress={() => setAuthScreenOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
          style={styles.signInButton}
        >
          <Text style={styles.signInText}>Sign in</Text>
        </Pressable>
      )}

      {authScreenOpen && <AuthScreen onClose={() => setAuthScreenOpen(false)} />}
    </View>
  );
}

function getAccountControlStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    greeting: {
      color: tokens.text,
      fontSize: 14,
    },
    signInButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: tokens.border,
      backgroundColor: tokens.surface,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    signInText: {
      color: tokens.text,
      fontSize: 14,
      fontWeight: "700",
    },
  });
}
