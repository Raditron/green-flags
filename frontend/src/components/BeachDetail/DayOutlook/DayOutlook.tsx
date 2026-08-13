import { HourDetail } from "../Timeline/HourDetail/HourDetail";
import { UnguardedNotice } from "../Timeline/UnguardedNotice/UnguardedNotice";
import { Verdict } from "../Timeline/Verdict/Verdict";
import { usePredictions } from "../hooks/usePredictions";
import { worstCaseHour } from "../utils/worstCaseHour";
import type { DayOutlookProps } from "./interfaces";
import { getDayOutlookStyles } from "./styles/DayOutlook.styles";

// Future-day counterpart to Timeline (see Timeline.tsx): a future day collapses to its single
// worst-case hour (#82's worstCaseHour) rather than a live-tracked "now", so this reuses Verdict's
// flag/sentence/caution and HourDetail's confidence ring as-is but skips everything Timeline shows
// that only makes sense for today — TimePicker, the live clock, the report-a-flag flow, and the
// off-window banner. See docs/adr/0010-worst-case-hour-of-day-in-frontend.md.
export function DayOutlook({ beachId, date, isUnguarded }: DayOutlookProps) {
  const predictions = usePredictions(beachId, date);
  const styles = getDayOutlookStyles();

  if (predictions.status === "loading") {
    return <p style={styles.status}>Loading forecast…</p>;
  }

  if (predictions.status === "error") {
    return <p style={styles.error}>Couldn't load this day: {predictions.message}</p>;
  }

  // Covers both the explicit 404 ("not-found") and the defensive case of a successful response
  // with no hour inside the 9-18 lifeguard window — both mean there's nothing yet to summarize.
  const worst = predictions.status === "success" ? worstCaseHour(predictions.data.hourlyPredictions) : null;

  if (!worst) {
    return <p style={styles.status}>No forecast yet for this day</p>;
  }

  return (
    <>
      <Verdict prediction={worst} />
      <p style={styles.worstAround}>Worst around {String(worst.hour).padStart(2, "0")}:00</p>

      {isUnguarded && <UnguardedNotice />}

      <div style={styles.detailRow}>
        <HourDetail prediction={worst} />
      </div>
    </>
  );
}
