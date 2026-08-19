import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { HourDetail } from "./HourDetail/HourDetail";
import { SeaConditions } from "./SeaConditions/SeaConditions";
import { TimePicker } from "./TimePicker/TimePicker";
import { UnguardedNotice } from "./UnguardedNotice/UnguardedNotice";
import { Verdict } from "./Verdict/Verdict";
import { useLiveClock } from "./hooks/useLiveClock";
import type { TimelineProps } from "./interfaces";
import { getTimelineStyles } from "./styles/Timeline.styles";

/**
 * RN port of frontend's Timeline/Timeline.tsx: today's hour-by-hour forecast, a live clock
 * tracking the current hour, and the confidence ring + itemized wind/sea conditions for whichever
 * hour is selected (live-tracked "now" by default, or a manually picked hour via TimePicker) —
 * #97's acceptance criteria. Omits frontend's report-the-flag entry point (ReportFlagPanel,
 * ReportedTodayNotice, useReportFlag, AuthModal) — that's #98's job, blocked on this ticket.
 */
export function Timeline({ hourlyPredictions, desaturated = false, currentHour = null, isUnguarded }: TimelineProps) {
  const { tokens } = useTheme();
  // null = still tracking "now" as the live clock ticks; the moment the visitor manually picks
  // an hour from TimePicker, this locks in and stops following the clock.
  const [manualHour, setManualHour] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const liveClock = useLiveClock();

  // currentHour is null outside the lifeguard window (see legalWindow.ts), in which case
  // there's no "now" to track at all — same off-hours behavior the old strip had.
  const trackedHour = currentHour !== null ? liveClock.hour : null;
  const selectedHour = manualHour ?? trackedHour;
  const selectedPrediction = hourlyPredictions.find((prediction) => prediction.hour === selectedHour);
  const styles = getTimelineStyles(tokens, { desaturated, flagColor: selectedPrediction?.flagColor });

  return (
    <>
      <Verdict prediction={selectedPrediction} desaturated={desaturated} />

      {isUnguarded && <UnguardedNotice />}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, alignItems: "stretch" }}>
        <View style={styles.card}>
          <Text style={styles.liveClock}>{liveClock.label}</Text>

          <Pressable
            onPress={() => setPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Choose prediction hour"
          >
            <Text style={styles.selectedTime}>
              {selectedHour !== null ? `${String(selectedHour).padStart(2, "0")}:00` : "Select hour"}
            </Text>
          </Pressable>
        </View>
        {selectedPrediction && (
          <>
            <HourDetail prediction={selectedPrediction} />
            <SeaConditions prediction={selectedPrediction} />
          </>
        )}
      </View>

      {pickerOpen && (
        <TimePicker
          hourlyPredictions={hourlyPredictions}
          selectedHour={selectedHour}
          currentHour={trackedHour}
          onPick={(hour) => {
            setManualHour(hour);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
