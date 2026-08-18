import type { DistributionBarPreset } from "../distributionPresets";

export interface DistributionBarProps<K extends string> extends DistributionBarPreset<K> {
  label: string;
  distribution: Record<K, number>;
  compact?: boolean;
}
