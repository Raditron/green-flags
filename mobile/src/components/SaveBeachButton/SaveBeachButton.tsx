import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useState } from "react";
import { Pressable } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../auth/AuthContext";
import { AuthScreen } from "../../auth/AuthScreen";
import { useSavedBeaches } from "../../saved/SavedBeachesContext";
import type { SaveBeachButtonProps } from "./interfaces";
import { getSaveBeachButtonStyles, saveBeachButtonIconColor } from "./styles/SaveBeachButton.styles";

/**
 * RN port of frontend's SaveBeachButton.tsx (icon-only variant — see interfaces/index.ts): a star
 * toggle, filled when the beach is saved, outline when it isn't, meant to be dropped in anywhere a
 * star appears (BeachDetail's #100 usage, and the Saved tab's grid — see SavedBeachesGrid). Reads
 * and writes through SavedBeachesContext so every instance for the same beach id stays in sync. A
 * signed-out tap opens AuthScreen instead of saving, the same modal AccountControl opens for
 * "Sign in" — matches frontend opening its own sign-in modal on a signed-out tap.
 */
export function SaveBeachButton({ beachId, onToggle }: SaveBeachButtonProps) {
  const { user } = useAuth();
  const { tokens } = useTheme();
  const { isSaved, toggleSave } = useSavedBeaches();
  const [pressed, setPressed] = useState(false);
  const [authScreenOpen, setAuthScreenOpen] = useState(false);
  const saved = Boolean(user) && isSaved(beachId);
  const active = saved || pressed;
  const styles = getSaveBeachButtonStyles(tokens, { active });

  function handlePress() {
    if (!user) {
      setAuthScreenOpen(true);
      return;
    }
    toggleSave(beachId);
    onToggle?.(!saved);
  }

  return (
    <>
      <Pressable
        onPress={handlePress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        accessibilityRole="button"
        accessibilityLabel={saved ? "Unsave beach" : "Save beach"}
        accessibilityState={{ selected: saved }}
        hitSlop={8}
        style={styles.button}
      >
        <FontAwesome6
          name="star"
          solid={saved}
          size={16}
          color={saveBeachButtonIconColor(tokens, active)}
        />
      </Pressable>
      {authScreenOpen && <AuthScreen onClose={() => setAuthScreenOpen(false)} />}
    </>
  );
}
