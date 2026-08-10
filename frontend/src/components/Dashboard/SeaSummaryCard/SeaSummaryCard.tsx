import { FaCloudBolt, FaFlag, FaWater, FaWind } from "react-icons/fa6";
import { getFlagStatusText } from "../../../shared/styles/flagColor";
import { DistributionBar } from "../DistributionBar/DistributionBar";
import { CONFIDENCE_BASIS_BAR, FLAG_COLOR_BAR, RIP_CURRENT_RISK_BAR } from "../DistributionBar/distributionPresets";
import type { AverageAttributes } from "../interfaces";
import { averageConditionsSentence, isLowSample, readingsFooter } from "../utils/formatAverageAttributes";
import { getSeaSummaryCardStyles } from "./styles/SeaSummaryCard.styles";

interface SeaSummaryCardProps {
  date: string;
  attributes: AverageAttributes;
}

// The sea-wide headline card: dominant flag color + a plain-language conditions sentence (the
// same "should I go in" answer Verdict.tsx gives for a single beach/hour), a storm-warning
// banner when warranted, the three distribution bars, scalar wind/wave/confidence stats, and the
// readings/beach-count footer every card carries.
export function SeaSummaryCard({ date, attributes }: SeaSummaryCardProps) {
  const styles = getSeaSummaryCardStyles({ flagColor: attributes.dominantFlagColor });
  const headline = getFlagStatusText(attributes.dominantFlagColor) ?? "Conditions estimate";
  const lowSample = isLowSample(attributes);
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section style={styles.card} aria-label="Sea-wide summary">
      <div style={styles.hero}>
        <FaFlag style={styles.heroIcon} aria-hidden="true" />
        <div style={styles.heroText}>
          <span style={styles.subtitle}>{formattedDate}</span>
          <span style={styles.headline}>{headline}</span>
          <span style={styles.sentence}>{averageConditionsSentence(attributes)}</span>
        </div>
      </div>

      {attributes.stormWarningActivePercent > 0 && (
        <div style={styles.stormBanner} role="alert">
          <FaCloudBolt style={styles.stormIcon} aria-hidden="true" />
          Storm warning active for {attributes.stormWarningActivePercent}% of today's readings
        </div>
      )}

      <div style={styles.distributions}>
        <DistributionBar label="Flag colors" distribution={attributes.flagColorDistribution} {...FLAG_COLOR_BAR} />
        <DistributionBar
          label="Rip current risk"
          distribution={attributes.ripCurrentRiskDistribution}
          {...RIP_CURRENT_RISK_BAR}
        />
        <DistributionBar
          label="Confidence basis"
          distribution={attributes.confidenceBasisDistribution}
          {...CONFIDENCE_BASIS_BAR}
        />
      </div>

      <div style={styles.stats}>
        <div style={styles.statRow}>
          <FaWind style={styles.statIcon} aria-hidden="true" />
          <span>
            {attributes.averageWindSpeedMps.toFixed(1)} m/s · {attributes.readableWindSpeed}
          </span>
        </div>
        <div style={styles.statRow}>
          <FaWater style={styles.statIcon} aria-hidden="true" />
          <span>
            {attributes.averageWaveHeightM.toFixed(1)} m, {attributes.averageWavePeriodS.toFixed(1)}s period ·{" "}
            {attributes.readableSeaState}
          </span>
        </div>
        <div style={styles.statRow}>
          <span>Confidence: {attributes.averageConfidencePercent}%</span>
        </div>
      </div>

      <p style={lowSample ? styles.footerLowSample : styles.footer}>
        {readingsFooter(attributes)}
        {lowSample && " — limited data"}
      </p>
    </section>
  );
}
