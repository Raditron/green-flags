import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Text, View } from "react-native";
import { useTheme } from "../../../../theme/ThemeContext";
import { WIND_FEEL, SEA_FEEL } from "../conditionsCopy";
import type { SeaConditionsProps } from "./interfaces";
import { getSeaConditionsStyles } from "./styles/SeaConditions.styles";

// RN port of frontend's Timeline/SeaConditions/SeaConditions.tsx. WIND_FEEL/SEA_FEEL live in
// ../conditionsCopy — shared with Verdict's synthesized sentence so the two never drift into
// describing the same wind differently.
export function SeaConditions({ prediction }: SeaConditionsProps) {
  const { tokens } = useTheme();
  const styles = getSeaConditionsStyles(tokens);

  return (
    <View style={styles.stack}>
      <View style={styles.panel} role="status">
        <FontAwesome6 name="wind" solid size={16} color={tokens.text} style={styles.icon} />
        <View style={styles.textCol}>
          <Text style={styles.label}>Wind: {prediction.readableWindSpeed}</Text>
          <Text style={styles.caption}>{WIND_FEEL[prediction.readableWindSpeed]}</Text>
        </View>
      </View>
      <View style={styles.panel} role="status">
        <FontAwesome6 name="water" solid size={16} color={tokens.text} style={styles.icon} />
        <View style={styles.textCol}>
          <Text style={styles.label}>Sea: {prediction.readableSeaState}</Text>
          <Text style={styles.caption}>{SEA_FEEL[prediction.readableSeaState]}</Text>
        </View>
      </View>
    </View>
  );
}
