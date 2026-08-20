import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Text, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { getFlagStatusText } from "../../../shared/styles/flagColor";
import { AttributeDistributions } from "../DistributionBar/AttributeDistributions";
import { averageConditionsSentence, isLowSample, readingsFooter } from "../utils/formatAverageAttributes";
import type { AreaCardProps } from "./interfaces";
import { getAreaCardStyles } from "./styles/AreaCard.styles";

// RN port of frontend/src/components/Dashboard/AreaCard/AreaCard.tsx. One grid card per Area —
// the same shape as SeaSummaryCard, scaled down: Area name + dominant flag instead of a full
// hero, a compact storm badge instead of a banner, and the same distributions/stats/footer so the
// same trust signals apply at every level of the summary.
export function AreaCard({ attributes }: AreaCardProps) {
  const { tokens } = useTheme();
  const { styles, flagVar } = getAreaCardStyles(tokens, { flagColor: attributes.dominantFlagColor });
  const headline = getFlagStatusText(attributes.dominantFlagColor) ?? "Conditions estimate";
  const lowSample = isLowSample(attributes);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {/* Same icon as frontend's FaFlag (react-icons/fa6) — see frontend AreaCard.tsx. */}
        <FontAwesome6 name="flag" solid size={14} color={flagVar} style={styles.flagIcon} />
        <View style={styles.headerText}>
          <Text style={styles.areaName} numberOfLines={1}>
            {attributes.area}
          </Text>
          <Text style={styles.headline}>{headline}</Text>
        </View>
        {attributes.stormWarningActivePercent > 0 && (
          <View
            style={styles.stormBadge}
            role="alert"
            accessibilityLabel={`Storm warning active for ${attributes.stormWarningActivePercent}% of today's readings`}
          >
            {/* Same icon as frontend's FaCloudBolt (react-icons/fa6) — see frontend AreaCard.tsx. */}
            <FontAwesome6 name="cloud-bolt" solid size={11} color={tokens.flagRed} />
            <Text style={styles.stormBadgeText}>{attributes.stormWarningActivePercent}%</Text>
          </View>
        )}
      </View>

      <Text style={styles.sentence}>{averageConditionsSentence(attributes)}</Text>

      <AttributeDistributions compact attributes={attributes} style={styles.distributions} />

      <View style={styles.stats}>
        <Text style={styles.statText}>
          {attributes.averageWindSpeedMps.toFixed(1)} m/s · {attributes.readableWindSpeed}
        </Text>
        <Text style={styles.statText}>
          {attributes.averageWaveHeightM.toFixed(1)} m · {attributes.readableSeaState}
        </Text>
        <Text style={styles.statText}>Confidence: {attributes.averageConfidencePercent}%</Text>
      </View>

      <Text style={lowSample ? styles.footerLowSample : styles.footer}>
        {readingsFooter(attributes)}
        {lowSample && " — limited data"}
      </Text>
    </View>
  );
}
