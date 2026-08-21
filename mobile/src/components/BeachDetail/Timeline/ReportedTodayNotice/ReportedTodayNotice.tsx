import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Text, View } from "react-native";
import { useTheme } from "../../../../theme/ThemeContext";
import type { FlagColor } from "../../../../shared/types/Beach";
import type { ReportedFlag } from "../../ReportFlag/interfaces";
import { getReportedTodayNoticeStyles } from "./styles/ReportedTodayNotice.styles";

interface ReportedTodayNoticeProps {
  reported: ReportedFlag;
}

const FLAG_LABEL: Record<FlagColor, string> = { green: "Green", yellow: "Yellow", red: "Red" };

/**
 * RN port of frontend's Timeline/ReportedTodayNotice/ReportedTodayNotice.tsx. Rendered under
 * Verdict once useReportFlag reports the visitor has already reported the flag for this beach
 * today — see Timeline.tsx. Same panel shape as UnguardedNotice (icon + text column, tinted
 * rather than solid-filled) but in the info blue rather than flag red, since this is confirming
 * something went right, not warning about a hazard. Echoes back the color the user reported (not
 * a date — "today" is implicit, this card only ever shows for today's report), plus whether that
 * color matched the prediction at the time it was submitted.
 */
export function ReportedTodayNotice({ reported }: ReportedTodayNoticeProps) {
  const { flagColor, agreesWithPrediction } = reported;
  const { tokens } = useTheme();
  const styles = getReportedTodayNoticeStyles(tokens);

  return (
    <View style={styles.panel} role="status">
      <FontAwesome6 name="circle-info" solid size={18} color={tokens.info} style={styles.icon} />
      <View style={styles.textCol}>
        <Text style={styles.headline}>Report submitted</Text>
        <Text style={styles.sentence}>Thanks — you reported the flag as {FLAG_LABEL[flagColor]} today.</Text>
        <Text style={styles.sentence}>
          {agreesWithPrediction ? "You agreed with our prediction." : "That's different from our prediction."}
        </Text>
      </View>
    </View>
  );
}
