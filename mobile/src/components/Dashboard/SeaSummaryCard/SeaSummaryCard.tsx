import { Text, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { getFlagStatusText } from "../../../shared/styles/flagColor";
import { DistributionBar } from "../DistributionBar/DistributionBar";
import { getConfidenceBasisBar, getFlagColorBar, getRipCurrentRiskBar } from "../DistributionBar/distributionPresets";
import { averageConditionsSentence, isLowSample, readingsFooter } from "../utils/formatAverageAttributes";
import type { SeaSummaryCardProps } from "./interfaces";
import { getSeaSummaryCardStyles } from "./styles/SeaSummaryCard.styles";

// RN port of frontend/src/components/Dashboard/SeaSummaryCard/SeaSummaryCard.tsx. The sea-wide
// headline card: dominant flag color + a plain-language conditions sentence (the same "should I
// go in" answer Verdict.tsx gives for a single beach/hour), a storm-warning banner when
// warranted, the three distribution bars, scalar wind/wave/confidence stats, and the
// readings/beach-count footer every card carries. Icon glyphs are plain Unicode Text (⚑/☈),
// mirroring ThemeToggle.tsx's ☀/☾ — no icon library is installed in mobile (frontend uses
// react-icons/fa6).
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
        <Text style={styles.heroIcon} aria-hidden>
          ⚑
        </Text>
        <View style={styles.heroText}>
          <Text style={styles.subtitle}>{formattedDate}</Text>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.sentence}>{averageConditionsSentence(attributes)}</Text>
        </View>
      </View>

      {attributes.stormWarningActivePercent > 0 && (
        <View style={styles.stormBanner} role="alert">
          <Text style={styles.stormIcon} aria-hidden>
            ☈
          </Text>
          <Text style={styles.stormText}>
            Storm warning active for {attributes.stormWarningActivePercent}% of today's readings
          </Text>
        </View>
      )}

      <View style={styles.distributions}>
        <DistributionBar label="Flag colors" distribution={attributes.flagColorDistribution} {...getFlagColorBar(tokens)} />
        <DistributionBar
          label="Rip current risk"
          distribution={attributes.ripCurrentRiskDistribution}
          {...getRipCurrentRiskBar(tokens)}
        />
        <DistributionBar
          label="Confidence basis"
          distribution={attributes.confidenceBasisDistribution}
          {...getConfidenceBasisBar(tokens)}
        />
      </View>

      <View style={styles.stats}>
        <View style={styles.statRow}>
          <Text style={styles.statIcon} aria-hidden>
            ≈
          </Text>
          <Text style={styles.statText}>
            {attributes.averageWindSpeedMps.toFixed(1)} m/s · {attributes.readableWindSpeed}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statIcon} aria-hidden>
            ∿
          </Text>
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
