import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { AuthScreen } from "../../../auth/AuthScreen";
import { HourDetail } from "./HourDetail/HourDetail";
import { ReportedTodayNotice } from "./ReportedTodayNotice/ReportedTodayNotice";
import { SeaConditions } from "./SeaConditions/SeaConditions";
import { TimePicker } from "./TimePicker/TimePicker";
import { UnguardedNotice } from "./UnguardedNotice/UnguardedNotice";
import { Verdict } from "./Verdict/Verdict";
import { useLiveClock } from "./hooks/useLiveClock";
import { ReportFlagPanel } from "../ReportFlag/ReportFlagPanel/ReportFlagPanel";
import { useReportFlag } from "../ReportFlag/hooks/useReportFlag";
import type { TimelineProps } from "./interfaces";
import { getTimelineStyles } from "./styles/Timeline.styles";

/**
 * RN port of frontend's Timeline/Timeline.tsx: today's hour-by-hour forecast, a live clock
 * tracking the current hour, the confidence ring + itemized wind/sea conditions for whichever
 * hour is selected (live-tracked "now" by default, or a manually picked hour via TimePicker), and
 * the report-the-flag entry point (ReportFlagPanel, ReportedTodayNotice, useReportFlag, plus
 * AuthScreen for a signed-out pick) — #97 and #98's acceptance criteria together.
 */
export function Timeline({
  beachId,
  hourlyPredictions,
  desaturated = false,
  currentHour = null,
  isUnguarded,
  onReportSubmitted,
}: TimelineProps) {
  const { tokens } = useTheme();
  // null = still tracking "now" as the live clock ticks; the moment the visitor manually picks
  // an hour from TimePicker, this locks in and stops following the clock.
  const [manualHour, setManualHour] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const liveClock = useLiveClock();

  // Checked against `=== false` rather than negated directly: while isUnguarded is still unknown
  // (undefined, before useBeach resolves it) this fails closed and keeps the report flow off
  // screen instead of flashing it on for what turns out to be an unguarded beach — the same
  // reasoning frontend's own gate applies (see useReportFlag.ts's doc comment).
  const reportFlag = useReportFlag(beachId, isUnguarded === false);

  // Fires onReportSubmitted exactly once per successful submission — submission.status flips to
  // "success" and stays there (see useReportFlag.ts: markReportedToday already swaps eligibility
  // to "already-reported" in the same update, so there's no transient "success" state to reset
  // out of, unlike the "error" status the hook itself auto-clears).
  useEffect(() => {
    if (reportFlag.submission.status === "success") {
      onReportSubmitted?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire only on the status transition itself, not on every onReportSubmitted identity change
  }, [reportFlag.submission.status]);

  // currentHour is null outside the lifeguard window (see legalWindow.ts), in which case
  // there's no "now" to track at all — same off-hours behavior the old strip had.
  const trackedHour = currentHour !== null ? liveClock.hour : null;
  const selectedHour = manualHour ?? trackedHour;
  const selectedPrediction = hourlyPredictions.find(
    prediction => prediction.hour === selectedHour,
  );
  const styles = getTimelineStyles(tokens, {
    desaturated,
    flagColor: selectedPrediction?.flagColor,
  });

  return (
    <>
      <Verdict prediction={selectedPrediction} desaturated={desaturated} />

      {/* Its own card below Verdict rather than inset inside it — see ReportFlagPanel. */}
      {reportFlag.canInvite && (
        <ReportFlagPanel
          submitting={reportFlag.submission.status === "submitting"}
          error={reportFlag.submission.status === "error" ? reportFlag.submission.message : undefined}
          onPick={reportFlag.onPick}
        />
      )}

      {reportFlag.showReportedToday && reportFlag.eligibility.status === "already-reported" && (
        <ReportedTodayNotice reported={reportFlag.eligibility.reported} />
      )}

      {isUnguarded && <UnguardedNotice />}

      <View style={styles.detailColumn}>
        <View style={styles.topRow}>
          <View style={styles.card}>
            <Text style={styles.liveClock}>{liveClock.label}</Text>

            <View style={styles.selectedTimeWrap}>
              <Pressable
                onPress={() => setPickerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Choose prediction hour"
              >
                <Text style={styles.selectedTime}>
                  {selectedHour !== null
                    ? `${String(selectedHour).padStart(2, "0")}:00`
                    : "Select hour"}
                </Text>
              </Pressable>
            </View>
          </View>
          {selectedPrediction && <HourDetail prediction={selectedPrediction} />}
        </View>
        {selectedPrediction && (
          <View style={styles.seaConditionsRow}>
            <SeaConditions prediction={selectedPrediction} />
          </View>
        )}
      </View>

      {pickerOpen && (
        <TimePicker
          hourlyPredictions={hourlyPredictions}
          selectedHour={selectedHour}
          currentHour={trackedHour}
          onPick={hour => {
            setManualHour(hour);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {reportFlag.authenticating && (
        <AuthScreen onClose={reportFlag.onAuthClose} onAuthenticated={reportFlag.onAuthenticated} />
      )}
    </>
  );
}
