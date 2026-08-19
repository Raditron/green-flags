import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { BlurView } from "expo-blur";
import { BORDER_RADIUS } from "../theme/tokens";
import type { ThemeTokens } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "./AuthContext";
import type { AuthFormMode, AuthScreenProps } from "./interfaces";

/**
 * RN port of frontend's Auth/AuthModal/AuthModal.tsx — combined log-in/sign-up screen, presented
 * via RN's built-in `<Modal>` and owned by the caller's local component state (AccountControl),
 * mirroring AuthModal being an overlay owned by Layout's local state rather than a route. Drops
 * the web-only hover/mount-transition cosmetics (no RN equivalent); the segmented mode tabs, error
 * copy, and field set otherwise match frontend one-for-one.
 */
export function AuthScreen({ onClose, onAuthenticated }: AuthScreenProps) {
  const { signUp, logIn } = useAuth();
  const { tokens, theme } = useTheme();
  const [mode, setMode] = useState<AuthFormMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const styles = getAuthScreenStyles(tokens);

  function switchMode(nextMode: AuthFormMode) {
    if (nextMode === mode) return;
    setError(null);
    setMode(nextMode);
  }

  async function handleSubmit() {
    // RN's TextInput has no native "required"/"minLength" validation like the web <input required
    // minLength={6}> that AuthModal relies on for these same guards — enforce them explicitly
    // instead.
    if (mode === "signup" && !displayName.trim()) return;
    if (!email.trim() || password.length < 6) return;

    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, displayName);
      } else {
        await logIn(email, password);
      }
      if (onAuthenticated) {
        onAuthenticated();
      } else {
        onClose();
      }
    } catch {
      setError(
        mode === "signup" ? "Could not create account. Try a different email." : "Invalid email or password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Matches frontend AuthModal.styles.ts's `backdrop.backdropFilter: blur(6px)`. `intensity`
            is expo-blur's abstract 1–100 scale, not a px radius, so 30 is a by-eye match rather than
            a unit conversion. Absolutely positioned + pointerEvents="none" so it's purely decorative
            behind the card and doesn't interfere with the backdrop Pressable's own touch handling.

            Android note: without a `blurTarget`/`blurMethod` pointing at a `BlurTargetView` wrapping
            the screen content behind this modal, expo-blur falls back to blurMethod="none" on Android
            — a flat tint, no actual blur (iOS blurs for real). Getting a true blur-behind would mean
            wrapping the screens behind AuthScreen in BlurTargetView and likely dropping RN's <Modal>
            for an in-tree overlay so they share a render tree — deliberately not doing that here;
            the tint-only fallback is the accepted tradeoff. */}
        <BlurView
          intensity={30}
          tint={theme}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {/* Empty onPress claims the touch responder so a tap inside the card doesn't bubble up
            to the backdrop's onPress and close the screen — RN's analogue of the web version's
            event.stopPropagation(). */}
        <Pressable style={styles.card} onPress={() => {}}>
          <ScrollView contentContainerStyle={styles.cardContent} keyboardShouldPersistTaps="handled">
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={styles.close}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>

            <View style={styles.kicker}>
              <Text style={styles.kickerIcon} aria-hidden>
                ⚑
              </Text>
              <Text style={styles.kickerText}>Green Flags</Text>
            </View>

            <Text style={styles.title}>{mode === "signup" ? "Create your account" : "Welcome back"}</Text>
            <Text style={styles.subtitle}>
              {mode === "signup"
                ? "Join to save beaches and get today's flag calls at a glance."
                : "Sign in to check today's flag and manage your saved beaches."}
            </Text>

            <View accessibilityRole="tablist" style={styles.segment}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: mode === "login" }}
                onPress={() => switchMode("login")}
                style={[styles.segmentTab, mode === "login" && styles.segmentTabActive]}
              >
                <Text style={[styles.segmentTabText, mode === "login" && styles.segmentTabTextActive]}>Log in</Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: mode === "signup" }}
                onPress={() => switchMode("signup")}
                style={[styles.segmentTab, mode === "signup" && styles.segmentTabActive]}
              >
                <Text style={[styles.segmentTabText, mode === "signup" && styles.segmentTabTextActive]}>
                  Sign up
                </Text>
              </Pressable>
            </View>

            {mode === "signup" && (
              <View style={styles.field}>
                <Text style={styles.label}>Display name</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  style={styles.input}
                  accessibilityLabel="Display name"
                  autoCapitalize="words"
                  placeholderTextColor={tokens.text}
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                accessibilityLabel="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={tokens.text}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                accessibilityLabel="Password"
                secureTextEntry
                placeholderTextColor={tokens.text}
              />
            </View>

            {error && (
              <View accessibilityRole="alert" style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel={mode === "signup" ? "Sign up" : "Log in"}
              style={[styles.submit, submitting && styles.submitDisabled]}
            >
              <Text style={styles.submitText}>
                {submitting ? "One moment…" : mode === "signup" ? "Sign up" : "Log in"}
              </Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function getAuthScreenStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(4, 10, 20, 0.6)",
      justifyContent: "center",
      padding: 20,
    },
    // Matches frontend AuthModal.styles.ts's `modal`: a deliberate Revolut-style deviation from the
    // standard BORDER_RADIUS, not drift — the whole card (this radius, the pill segment/inputs/
    // submit below) is one intentional shape language, kept in sync with frontend by eye.
    card: {
      borderRadius: 28,
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
      maxHeight: "90%",
    },
    cardContent: {
      padding: 24,
      gap: 12,
    },
    close: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    closeText: {
      fontSize: 20,
      color: tokens.text,
    },
    // Matches frontend AuthModal.styles.ts's `kicker`: small uppercase "Green Flags" wordmark above
    // the title, using the same plain-glyph icon convention as SeaSummaryCard's heroIcon (no icon
    // library is installed) in place of frontend's FaFlag.
    kicker: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 10,
    },
    kickerIcon: {
      fontSize: 11,
      color: tokens.flagGreen,
    },
    kickerText: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.9,
      textTransform: "uppercase",
      color: tokens.flagGreen,
    },
    title: {
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.4,
      color: tokens.textHeading,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      opacity: 0.8,
      color: tokens.text,
    },
    // Matches frontend's getAuthSegmentTabStyle: the active tab floats as a raised `surface`-colored
    // pill inset within the `bg`-colored track (the padding/gap below is what creates that inset —
    // without it the active half just abuts the track edge-to-edge), not a flat two-tone split.
    segment: {
      flexDirection: "row",
      gap: 4,
      padding: 4,
      borderRadius: 999,
      backgroundColor: tokens.bg,
      borderWidth: 1,
      borderColor: tokens.border,
    },
    segmentTab: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 9,
      alignItems: "center",
    },
    segmentTabActive: {
      backgroundColor: tokens.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 2,
    },
    segmentTabText: {
      fontSize: 14,
      fontWeight: "700",
      opacity: 0.75,
      color: tokens.text,
    },
    segmentTabTextActive: {
      opacity: 1,
      color: tokens.textHeading,
    },
    field: {
      gap: 4,
    },
    label: {
      fontSize: 13,
      color: tokens.text,
    },
    input: {
      borderWidth: 1,
      borderColor: tokens.border,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 15,
      color: tokens.text,
      backgroundColor: tokens.bg,
    },
    errorBanner: {
      borderWidth: 1,
      borderColor: tokens.error,
      borderRadius: BORDER_RADIUS,
      padding: 10,
    },
    errorText: {
      color: tokens.error,
      fontSize: 13,
    },
    submit: {
      marginTop: 4,
      borderRadius: 999,
      paddingVertical: 12,
      alignItems: "center",
      backgroundColor: tokens.flagGreen,
    },
    submitDisabled: {
      opacity: 0.6,
    },
    submitText: {
      color: tokens.mediaBadgeFg,
      fontSize: 15,
      fontWeight: "700",
    },
  });
}
