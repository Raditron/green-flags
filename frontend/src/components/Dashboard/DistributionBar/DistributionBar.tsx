import { getDistributionBarStyles } from "./styles/DistributionBar.styles";
import type { DistributionBarPreset } from "./distributionPresets";

interface DistributionBarProps<K extends string> extends DistributionBarPreset<K> {
  label: string;
  distribution: Record<K, number>;
  compact?: boolean;
}

// One horizontal, three-segment stacked bar — no chart library, just a `div` per key sized to
// that key's percent. Shared by SeaSummaryCard and AreaCard for all three distributions (flag
// color, rip-current risk, confidence basis); which colors/labels/order apply comes from the
// caller via a DistributionBarPreset (see distributionPresets.ts), so this component itself
// stays ignorant of what it's charting.
export function DistributionBar<K extends string>({
  label,
  distribution,
  order,
  colorForKey,
  labelForKey,
  compact = false,
}: DistributionBarProps<K>) {
  const styles = getDistributionBarStyles({ compact });
  const summary = order.map((key) => `${labelForKey[key]} ${distribution[key]}%`).join(", ");

  return (
    <div style={styles.wrap}>
      <span style={styles.label}>{label}</span>

      <div style={styles.track} role="img" aria-label={`${label}: ${summary}`}>
        {order.map(
          (key) =>
            distribution[key] > 0 && (
              <div
                key={key}
                style={{ ...styles.segment, width: `${distribution[key]}%`, background: colorForKey[key] }}
              />
            )
        )}
      </div>

      <div style={styles.legend}>
        {order.map((key) => (
          <span key={key} style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: colorForKey[key] }} />
            {labelForKey[key]} {distribution[key]}%
          </span>
        ))}
      </div>
    </div>
  );
}
