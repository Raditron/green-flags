import { Text, View } from "react-native";
import { useTheme } from "../../../../theme/ThemeContext";
import { ReportPrompt } from "../ReportPrompt/ReportPrompt";
import type { ReportFlagPanelProps } from "./interfaces";
import { getReportFlagPanelStyles } from "./styles/ReportFlagPanel.styles";

/**
 * RN port of frontend's ReportFlagPanel/ReportFlagPanel.tsx. Rendered under Verdict (see
 * Timeline.tsx) rather than inset inside it — voting on a wrong-looking flag is still a single
 * tap away, it just no longer has to share Verdict's solid flag-color panel to get there. No
 * intro line of its own: ReportPrompt's "Think this flag is wrong?" heading already carries that
 * job now that this is its own card rather than something needing to be pointed at from inside
 * Verdict. Timeline only renders this at all once useReportFlag says picking a color is actually
 * possible right now.
 */
export function ReportFlagPanel({ submitting, error, onPick }: ReportFlagPanelProps) {
  const { tokens } = useTheme();
  const styles = getReportFlagPanelStyles(tokens);

  return (
    <View style={styles.panel}>
      {error && <Text style={styles.error}>{error}</Text>}
      <ReportPrompt submitting={submitting} onPick={onPick} />
    </View>
  );
}
