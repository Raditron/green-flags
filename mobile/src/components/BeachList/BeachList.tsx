import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BeachesTabScreenProps } from "../../navigation/interfaces";

/**
 * Placeholder for the Beaches tab. Mirrors `frontend/src/components/BeachList/BeachList.tsx`
 * (curated beach list with Area/search/flag filters) — filled in by #96.
 *
 * For now, a single placeholder item demonstrates pushing Beach Detail onto the root stack, with
 * back navigation returning here — the navigable skeleton #92 exists to prove.
 */
export function BeachList({ navigation }: BeachesTabScreenProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.item}
        onPress={() => navigation.navigate("BeachDetail", { beachId: "placeholder-beach" })}
      >
        <Text style={styles.itemText}>Placeholder beach</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c1d1e1",
  },
  itemText: {
    fontSize: 16,
  },
});
