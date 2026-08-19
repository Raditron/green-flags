import { View } from "react-native";
import type { ViewStyle } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { DistributionBar } from "./DistributionBar";
import { getConfidenceBasisBar, getFlagColorBar, getRipCurrentRiskBar } from "./distributionPresets";
import type { AverageAttributes } from "../interfaces";

interface AttributeDistributionsProps {
  attributes: AverageAttributes;
  compact?: boolean;
  style?: ViewStyle;
}

// The three distribution bars (flag colors, rip-current risk, confidence basis) that both
// SeaSummaryCard and AreaCard render for whatever AverageAttributes they're given, in the same
// order, wired to the same presets — extracted here so that shape lives in one place instead of
// being copy-pasted across both cards.
export function AttributeDistributions({ attributes, compact = false, style }: AttributeDistributionsProps) {
  const { tokens } = useTheme();

  return (
    <View style={style}>
      <DistributionBar
        compact={compact}
        label="Flag colors"
        distribution={attributes.flagColorDistribution}
        {...getFlagColorBar(tokens)}
      />
      <DistributionBar
        compact={compact}
        label="Rip current risk"
        distribution={attributes.ripCurrentRiskDistribution}
        {...getRipCurrentRiskBar(tokens)}
      />
      <DistributionBar
        compact={compact}
        label="Confidence basis"
        distribution={attributes.confidenceBasisDistribution}
        {...getConfidenceBasisBar(tokens)}
      />
    </View>
  );
}
