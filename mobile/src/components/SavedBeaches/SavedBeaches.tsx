import { Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { getSavedBeachesStyles } from "./styles/SavedBeaches.styles";

/**
 * Placeholder for the Saved tab. Mirrors `frontend/src/components/SavedBeaches/SavedBeaches.tsx`
 * (grid of the signed-in user's saved beaches) — filled in by #100.
 */
export function SavedBeaches() {
  const { tokens } = useTheme();
  const styles = getSavedBeachesStyles(tokens);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Saved placeholder</Text>
    </View>
  );
}
