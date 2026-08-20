import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../auth/AuthContext";
import { AuthScreen } from "../../auth/AuthScreen";
import { useSavedBeachesList } from "./hooks/useSavedBeachesList";
import { SavedBeachesGrid } from "./SavedBeachesGrid/SavedBeachesGrid";
import { getSavedBeachesStyles } from "./styles/SavedBeaches.styles";
import type { SavedTabScreenProps } from "../../navigation/interfaces";
import type { Beach } from "../../shared/types/Beach";

/**
 * The Saved tab: the signed-in visitor's shortlist, in the same card grid as the Beaches tab —
 * #100's acceptance criteria. RN port of frontend's SavedBeaches.tsx, with one deliberate
 * departure: frontend redirects a signed-out visitor straight to the Dashboard (`<Navigate to="/"
 * />`, see #23's Implementation Decisions); mobile instead renders an in-place sign-in prompt (this
 * component's own class doc on getSavedBeachesStyles explains why) — the Saved tab (see
 * RootNavigator.tsx) is always visible now rather than hidden while signed out, so "reaching the
 * Saved tab" while signed out is a real, reachable state this screen has to answer for itself
 * rather than one only a bookmark could produce.
 *
 * Waits for auth to resolve (`authLoading`) before deciding what to show — a signed-in visitor
 * whose session is still loading gets the loading message, not a flash of the sign-in prompt.
 */
export function SavedBeaches({ navigation }: SavedTabScreenProps) {
  const { user, loading: authLoading } = useAuth();
  const savedBeaches = useSavedBeachesList(user);
  const { tokens } = useTheme();
  const styles = getSavedBeachesStyles(tokens);
  const [authScreenOpen, setAuthScreenOpen] = useState(false);

  function handlePressBeach(beach: Beach) {
    // Passes what this card already has, mirroring BeachList.tsx's handlePressBeach — see useBeach,
    // which prefers these over re-fetching the beach list just to show the same fields again.
    navigation.navigate("BeachDetail", {
      beachId: beach.id,
      name: beach.name,
      quirkNotes: beach.quirkNotes,
      isUnguarded: beach.isUnguarded,
    });
  }

  return (
    <View style={styles.container} accessibilityLabel="Saved">
      <Text style={styles.title} role="heading" aria-level={1}>
        Saved
      </Text>

      {authLoading && <Text style={styles.message}>Loading…</Text>}

      {!authLoading && !user && (
        <View style={styles.signInPrompt}>
          <FontAwesome6 name="star" size={40} color={tokens.iconChipFg} />
          <Text style={styles.signInHeadline}>Sign in to see your saved beaches</Text>
          <Text style={styles.signInBody}>
            Save a beach from its detail page to build your own shortlist, then find every one of
            them here.
          </Text>
          <Pressable
            onPress={() => setAuthScreenOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            style={styles.signInButton}
          >
            <Text style={styles.signInButtonText}>Sign in</Text>
          </Pressable>
        </View>
      )}

      {!authLoading && user && savedBeaches.status === "loading" && (
        <Text style={styles.message}>Loading saved beaches…</Text>
      )}

      {!authLoading && user && savedBeaches.status === "error" && (
        <Text style={styles.error}>Could not load saved beaches: {savedBeaches.message}</Text>
      )}

      {!authLoading && user && savedBeaches.status === "success" && (
        <SavedBeachesGrid beaches={savedBeaches.data} onPressBeach={handlePressBeach} />
      )}

      {authScreenOpen && (
        <AuthScreen onClose={() => setAuthScreenOpen(false)} onAuthenticated={() => setAuthScreenOpen(false)} />
      )}
    </View>
  );
}
