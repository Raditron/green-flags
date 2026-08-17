import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import type { BeachesTabScreenProps } from "../../navigation/interfaces";
import { getBeachListStyles } from "./styles/BeachList.styles";

/**
 * Placeholder for the Beaches tab. Mirrors `frontend/src/components/BeachList/BeachList.tsx`
 * (curated beach list with Area/search/flag filters) — filled in by #96.
 *
 * For now, a single placeholder item demonstrates pushing Beach Detail onto the root stack, with
 * back navigation returning here — the navigable skeleton #92 exists to prove.
 */
export function BeachList({ navigation }: BeachesTabScreenProps) {
  const { tokens } = useTheme();
  const styles = getBeachListStyles(tokens);

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
