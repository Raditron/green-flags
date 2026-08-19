import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Text, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { getFlagStatusText } from "../../../shared/styles/flagColor";
import { AttributeDistributions } from "../DistributionBar/AttributeDistributions";
import { averageConditionsSentence, isLowSample, readingsFooter } from "../utils/formatAverageAttributes";
import type { SeaSummaryCardProps } from "./interfaces";
import { getSeaSummaryCardStyles } from "./styles/SeaSummaryCard.styles";

// RN port of frontend/src/components/Dashboard/SeaSummaryCard/SeaSummaryCard.tsx. The sea-wide
// headline card: dominant flag color + a plain-language conditions sentence (the same "should I
// go in" answer Verdict.tsx gives for a single beach/hour), a storm-warning banner when
// warranted, the three distribution bars, scalar wind/wave/confidence stats, and the
// readings/beach-count footer every card carries. Icons are FontAwesome6, matching frontend's
// react-icons/fa6 choices (FaFlag/FaCloudBolt/FaWind/FaWater) — see AreaSelect.tsx for the
// icon-library precedent.
export function SeaSummaryCard({ date, attributes }: SeaSummaryCardProps) {
  const { tokens } = useTheme();
  const styles = getSeaSummaryCardStyles(tokens, { flagColor: attributes.dominantFlagColor });
  const headline = getFlagStatusText(attributes.dominantFlagColor) ?? "Conditions estimate";
  const lowSample = isLowSample(attributes);
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={styles.card} accessibilityLabel="Sea-wide summary">
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          {/* Same icon as frontend's FaFlag (react-icons/fa6) — see frontend SeaSummaryCard.tsx. */}
          <FontAwesome6 name="flag" solid size={20} color="#fff" style={styles.heroIcon} />
          <Text style={styles.subtitle}>{formattedDate}</Text>
        </View>
        <View style={styles.heroText}>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.sentence}>{averageConditionsSentence(attributes)}</Text>
        </View>
      </View>

      {attributes.stormWarningActivePercent > 0 && (
        <View style={styles.stormBanner} role="alert">
          {/* Same icon as frontend's FaCloudBolt (react-icons/fa6) — see frontend SeaSummaryCard.tsx. */}
          <FontAwesome6 name="cloud-bolt" solid size={15} color={tokens.flagRed} />
          <Text style={styles.stormText}>
            Storm warning active for {attributes.stormWarningActivePercent}% of today's readings
          </Text>
        </View>
      )}

      <AttributeDistributions attributes={attributes} style={styles.distributions} />

      <View style={styles.stats}>
        <View style={styles.statRow}>
          {/* Same icon as frontend's FaWind (react-icons/fa6) — see frontend SeaSummaryCard.tsx. */}
          <FontAwesome6 name="wind" solid size={14} color={tokens.text} style={styles.statIcon} />
          <Text style={styles.statText}>
            {attributes.averageWindSpeedMps.toFixed(1)} m/s · {attributes.readableWindSpeed}
          </Text>
        </View>
        <View style={styles.statRow}>
          {/* Same icon as frontend's FaWater (react-icons/fa6) — see frontend SeaSummaryCard.tsx. */}
          <FontAwesome6 name="water" solid size={14} color={tokens.text} style={styles.statIcon} />
          <Text style={styles.statText}>
            {attributes.averageWaveHeightM.toFixed(1)} m, {attributes.averageWavePeriodS.toFixed(1)}s period ·{" "}
            {attributes.readableSeaState}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statText}>Confidence: {attributes.averageConfidencePercent}%</Text>
        </View>
      </View>

      <Text style={lowSample ? styles.footerLowSample : styles.footer}>
        {readingsFooter(attributes)}
        {lowSample && " — limited data"}
      </Text>
    </View>
  );
}
