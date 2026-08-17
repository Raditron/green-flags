import { StyleSheet, Text, View } from "react-native";

/**
 * Placeholder for the Today tab. Mirrors `frontend/src/components/Dashboard/Dashboard.tsx`
 * (today's sea-wide average conditions + per-Area breakdown) — filled in by #95.
 */
export function Dashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Today placeholder</Text>
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
