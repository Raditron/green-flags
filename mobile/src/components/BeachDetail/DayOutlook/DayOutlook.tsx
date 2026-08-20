import { Text, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { HourDetail } from "../Timeline/HourDetail/HourDetail";
import { SeaConditions } from "../Timeline/SeaConditions/SeaConditions";
import { UnguardedNotice } from "../Timeline/UnguardedNotice/UnguardedNotice";
import { Verdict } from "../Timeline/Verdict/Verdict";
import { usePredictions } from "../hooks/usePredictions";
import { worstCaseHour } from "../utils/worstCaseHour";
import type { DayOutlookProps } from "./interfaces";
import { getDayOutlookStyles } from "./styles/DayOutlook.styles";
import { WorstAroundNotice } from "./WorstAroundNotice/WorstAroundNotice";

// RN port of frontend's DayOutlook.tsx: the future-day counterpart to Timeline. A future day
// collapses to its single worst-case hour (worstCaseHour) rather than a live-tracked "now", so
// this reuses Verdict's flag/sentence/caution, HourDetail's confidence ring, and SeaConditions'
// wind/sea readout as-is but skips everything Timeline shows that only makes sense for today —
// TimePicker, the live clock, and the report-a-flag flow (#98).
export function DayOutlook({ beachId, date, isUnguarded }: DayOutlookProps) {
  const { tokens } = useTheme();
  const predictions = usePredictions(beachId, date);
  const styles = getDayOutlookStyles(tokens);

  if (predictions.status === "loading") {
    return <Text style={styles.status}>Loading forecast…</Text>;
  }

  if (predictions.status === "error") {
    return <Text style={styles.error}>Couldn't load this day: {predictions.message}</Text>;
  }

  // Covers both the explicit 404 ("not-found") and the defensive case of a successful response
  // with no hour inside the 9-18 lifeguard window — both mean there's nothing yet to summarize.
  const worst = predictions.status === "success" ? worstCaseHour(predictions.data.hourlyPredictions) : null;

  if (!worst) {
    return <Text style={styles.status}>No forecast yet for this day</Text>;
  }

  // worst is only ever non-null when predictions.status === "success" (see above), so this is
  // always the API's date for the day rather than re-deriving it from the `date` prop — same
  // source of truth Timeline's "Predictions for {date}" meta line uses.
  const predictionsDate = predictions.status === "success" ? predictions.data.date : null;

  return (
    <>
      <Verdict prediction={worst} />
      <WorstAroundNotice hour={worst.hour} />

      {isUnguarded && <UnguardedNotice />}

      <View style={styles.detailColumn}>
        <View style={styles.topRow}>
          <HourDetail prediction={worst} />
        </View>
        <View style={styles.seaConditionsRow}>
          <SeaConditions prediction={worst} />
        </View>
      </View>

      <Text style={styles.meta}>Predictions for {predictionsDate}</Text>
    </>
  );
}
