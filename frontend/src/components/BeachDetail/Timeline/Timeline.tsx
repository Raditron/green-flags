import { useState } from "react";
import { AuthModal } from "../../Auth/AuthModal/AuthModal";
import { ReportFlagPanel } from "../ReportFlag/ReportFlagPanel/ReportFlagPanel";
import { useReportFlag } from "../ReportFlag/hooks/useReportFlag";
import { HourDetail } from "./HourDetail/HourDetail";
import { ReportedTodayNotice } from "./ReportedTodayNotice/ReportedTodayNotice";
import { SeaConditions } from "./SeaConditions/SeaConditions";
import { TimePicker } from "./TimePicker/TimePicker";
import { UnguardedNotice } from "./UnguardedNotice/UnguardedNotice";
import { Verdict } from "./Verdict/Verdict";
import { useLiveClock } from "./hooks/useLiveClock";
import type { TimelineProps } from "./interfaces";
import { getTimelineStyles } from "./styles/Timeline.styles";

export function Timeline({
  hourlyPredictions,
  desaturated = false,
  currentHour = null,
  updatedAt,
  isUnguarded,
  beachId,
}: TimelineProps) {
  // null = still tracking "now" as the live clock ticks; the moment the visitor manually
  // picks an hour from the popup, this locks in and stops following the clock.
  const [manualHour, setManualHour] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [timeHovered, setTimeHovered] = useState(false);
  const liveClock = useLiveClock();

  // currentHour is null outside the lifeguard window (see legalWindow.ts), in which case
  // there's no "now" to track at all — same off-hours behavior the old strip had.
  const trackedHour = currentHour !== null ? liveClock.hour : null;
  const selectedHour = manualHour ?? trackedHour;
  const selectedPrediction = hourlyPredictions.find(
    prediction => prediction.hour === selectedHour,
  );
  const styles = getTimelineStyles({
    desaturated,
    flagColor: selectedPrediction?.flagColor,
    timeHovered,
  });

  // Checked against `=== false` rather than negated directly: while isUnguarded is still
  // unknown (undefined, before useBeach resolves it) this fails closed and keeps the report
  // flow off screen instead of flashing it on for what turns out to be an unguarded beach —
  // the same reasoning the old standalone ReportFlagButton applied itself.
  const reportFlag = useReportFlag(beachId, isUnguarded === false);
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

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "stretch" }}>
        <div style={styles.card}>
          <span style={styles.liveClock}>{liveClock.label}</span>

          <button
            type="button"
            style={styles.selectedTime}
            onClick={() => setPickerOpen(true)}
            onMouseEnter={() => setTimeHovered(true)}
            onMouseLeave={() => setTimeHovered(false)}
            aria-haspopup="dialog"
            aria-label="Choose prediction hour"
          >
            {selectedHour !== null
              ? `${String(selectedHour).padStart(2, "0")}:00`
              : "Select hour"}
          </button>

          {updatedAt && (
            <span style={styles.updatedAt}>
              Updated{" "}
              {new Date(updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        {selectedPrediction && (
          <>
            <HourDetail prediction={selectedPrediction} />
            <SeaConditions prediction={selectedPrediction} />
          </>
        )}
      </div>

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
        <AuthModal onClose={reportFlag.onAuthClose} onAuthenticated={reportFlag.onAuthenticated} />
      )}
    </>
  );
}
