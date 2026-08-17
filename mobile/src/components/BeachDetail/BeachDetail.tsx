import { Text, View } from "react-native";
import type { BeachDetailScreenProps } from "../../navigation/interfaces";
import { getBeachDetailStyles } from "./styles/BeachDetail.styles";

/**
 * Placeholder for the Beach Detail stack screen, reachable by pushing from the Beaches tab (see
 * `BeachList`). Mirrors `frontend/src/components/BeachDetail/BeachDetail.tsx` (hero photo,
 * Timeline, ForecastStrip, reporting, comments) — filled in by #97, #98, #99.
 *
 * Demonstrates the full colocation convention (`interfaces/`, `styles/`) that every later
 * component follows — see `frontend/CONVENTIONS.md`.
 */
export function BeachDetail({ route }: BeachDetailScreenProps) {
  const { beachId } = route.params;
  const styles = getBeachDetailStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Beach Detail</Text>
      <Text style={styles.beachId}>{beachId}</Text>
    </View>
  );
}
