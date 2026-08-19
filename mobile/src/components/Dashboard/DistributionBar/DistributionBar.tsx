import { View, Text } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import type { DistributionBarProps } from "./interfaces";
import { getDistributionBarStyles } from "./styles/DistributionBar.styles";

// RN port of frontend/src/components/Dashboard/DistributionBar/DistributionBar.tsx. One
// horizontal, three-segment stacked bar — no chart library, just a `View` per key sized to that
// key's percent. Shared by SeaSummaryCard and AreaCard for all three distributions (flag color,
// rip-current risk, confidence basis); which colors/labels/order apply comes from the caller via
// a DistributionBarPreset (see distributionPresets.ts), so this component itself stays ignorant
// of what it's charting.
export function DistributionBar<K extends string>({
  label,
  distribution,
  order,
  colorForKey,
  labelForKey,
  compact = false,
}: DistributionBarProps<K>) {
  const { tokens } = useTheme();
  const styles = getDistributionBarStyles(tokens, { compact });
  const summary = order.map((key) => `${labelForKey[key]} ${distribution[key]}%`).join(", ");

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>

      {/* Mirrors web's `role="img"` + summarizing `aria-label` — a screen reader announces the
          whole distribution as one image rather than reading each segment View individually. */}
      <View style={styles.track} accessibilityRole="image" accessibilityLabel={`${label}: ${summary}`}>
        {order.map(
          (key) =>
            distribution[key] > 0 && (
              <View
                key={key}
                style={[styles.segment, { width: `${distribution[key]}%`, backgroundColor: colorForKey[key] }]}
              />
            ),
        )}
      </View>

      <View style={styles.legend}>
        {order.map((key) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colorForKey[key] }]} />
            <Text style={styles.legendText}>
              {labelForKey[key]} {distribution[key]}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
