import { FaCloudBolt, FaFlag } from "react-icons/fa6";
import { getFlagStatusText } from "../../../shared/styles/flagColor";
import { Tooltip } from "../../Tooltip/Tooltip";
import { DistributionBar } from "../DistributionBar/DistributionBar";
import { CONFIDENCE_BASIS_BAR, FLAG_COLOR_BAR, RIP_CURRENT_RISK_BAR } from "../DistributionBar/distributionPresets";
import { averageConditionsSentence, isLowSample, readingsFooter } from "../utils/formatAverageAttributes";
import type { AreaCardProps } from "./interfaces";
import { getAreaCardStyles } from "./styles/AreaCard.styles";

// One grid card per Area — the same shape as SeaSummaryCard, scaled down: Area name + dominant
// flag instead of a full hero, a compact storm badge instead of a banner, and the same
// distributions/stats/footer so the same trust signals apply at every level of the summary.
export function AreaCard({ attributes }: AreaCardProps) {
  const styles = getAreaCardStyles({ flagColor: attributes.dominantFlagColor });
  const headline = getFlagStatusText(attributes.dominantFlagColor) ?? "Conditions estimate";
  const lowSample = isLowSample(attributes);

  return (
    <li style={styles.card}>
      <div style={styles.header}>
        <FaFlag style={styles.flagIcon} aria-hidden="true" />
        <div style={styles.headerText}>
          <span style={styles.areaName}>{attributes.area}</span>
          <span style={styles.headline}>{headline}</span>
        </div>
        {attributes.stormWarningActivePercent > 0 && (
          <Tooltip
            text={`Storm warning active for ${attributes.stormWarningActivePercent}% of today's readings`}
            align="end"
          >
            <span style={styles.stormBadge} role="alert">
              <FaCloudBolt aria-hidden="true" />
              {attributes.stormWarningActivePercent}%
            </span>
          </Tooltip>
        )}
      </div>

      <span style={styles.sentence}>{averageConditionsSentence(attributes)}</span>

      <div style={styles.distributions}>
        <DistributionBar
          compact
          label="Flag colors"
          distribution={attributes.flagColorDistribution}
          {...FLAG_COLOR_BAR}
        />
        <DistributionBar
          compact
          label="Rip current risk"
          distribution={attributes.ripCurrentRiskDistribution}
          {...RIP_CURRENT_RISK_BAR}
        />
        <DistributionBar
          compact
          label="Confidence basis"
          distribution={attributes.confidenceBasisDistribution}
          {...CONFIDENCE_BASIS_BAR}
        />
      </div>

      <div style={styles.stats}>
        <span>
          {attributes.averageWindSpeedMps.toFixed(1)} m/s · {attributes.readableWindSpeed}
        </span>
        <span>
          {attributes.averageWaveHeightM.toFixed(1)} m · {attributes.readableSeaState}
        </span>
        <span>Confidence: {attributes.averageConfidencePercent}%</span>
      </div>

      <p style={lowSample ? styles.footerLowSample : styles.footer}>
        {readingsFooter(attributes)}
        {lowSample && " — limited data"}
      </p>
    </li>
  );
}
