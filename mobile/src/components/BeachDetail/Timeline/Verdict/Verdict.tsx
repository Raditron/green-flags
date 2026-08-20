import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Text, View } from "react-native";
import { useTheme } from "../../../../theme/ThemeContext";
import { getFlagStatusText } from "../../../../shared/styles/flagColor";
import { conditionsSentence, RIP_CURRENT_CAUTION } from "../conditionsCopy";
import type { VerdictProps } from "./interfaces";
import { getVerdictStyles } from "./styles/Verdict.styles";

/**
 * RN port of frontend's Timeline/Verdict/Verdict.tsx. The single-glance answer to "should I go
 * in, and how will it feel" for the selected hour — flag status, a plain-language conditions
 * sentence, and a rip-current caution when it's actually warranted. Everything else Timeline
 * shows (time picker, confidence ring, itemized wind/sea rows) is supporting detail for someone
 * who wants to know why, not the first thing they read.
 */
export function Verdict({ prediction, desaturated = false }: VerdictProps) {
  const { tokens } = useTheme();
  if (!prediction) return null;

  const styles = getVerdictStyles(tokens, { flagColor: prediction.flagColor, desaturated });
  const headline = getFlagStatusText(prediction.flagColor) ?? "Conditions estimate";
  const caution = RIP_CURRENT_CAUTION[prediction.ripCurrentRisk];

  return (
    <View style={styles.panel} role="status">
      <FontAwesome6 name="flag" solid size={22} color="#fff" style={styles.icon} />
      <View style={styles.textCol}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.sentence}>{conditionsSentence(prediction)}</Text>
        {caution && <Text style={styles.caution}>{caution}</Text>}
      </View>
    </View>
  );
}
