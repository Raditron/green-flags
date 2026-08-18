import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ThemeTokens } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { AuthScreen } from "./AuthScreen";
import { useAuth } from "./AuthContext";
import { UserMenu } from "./UserMenu";

/**
 * RN port of frontend's Layout.tsx `rightGroup` (the `UserMenu`/"Sign in" half of it — ThemeToggle
 * is already its own root-rendered control), plus its `titleBlock`'s `greetingName` span — mobile
 * has no separate title area to put a greeting next to, so it's folded in alongside UserMenu here
 * instead, using the same "everything before the @" derivation as frontend's `greetingName`. Like
 * ThemeToggle, mobile has no header chrome to sit in, so this positions itself as a floating chip
 * via useSafeAreaInsets(); it takes the top-left corner since ThemeToggle already occupies
 * top-right. Rendered once at the app root (App.tsx). While signed out, owns the local
 * `authScreenOpen` state that frontend's Layout keeps as `modalOpen`, opening AuthScreen the same
 * way Layout opens AuthModal.
 */
export function AccountControl() {
  const { user, loading } = useAuth();
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { top: insets.top + 8, left: 16 }]}>
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
      position: "absolute",
      zIndex: 1000,
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
