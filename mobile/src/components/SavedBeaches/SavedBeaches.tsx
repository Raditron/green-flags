import { StyleSheet, Text, View } from "react-native";

/**
 * Placeholder for the Saved tab. Mirrors `frontend/src/components/SavedBeaches/SavedBeaches.tsx`
 * (grid of the signed-in user's saved beaches) — filled in by #100.
 */
export function SavedBeaches() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Saved placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
  },
});
