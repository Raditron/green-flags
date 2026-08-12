import { FaCircleInfo } from "react-icons/fa6";
import type { FlagColor } from "../../../../shared/types/Beach";
import type { ReportedFlag } from "../../ReportFlag/interfaces";
import { getReportedTodayNoticeStyles } from "./styles/ReportedTodayNotice.styles";

interface ReportedTodayNoticeProps {
  reported: ReportedFlag;
}

const FLAG_LABEL: Record<FlagColor, string> = { green: "Green", yellow: "Yellow", red: "Red" };

// Rendered under Verdict once useReportFlag reports the visitor has already reported the
// flag for this beach today — see Timeline.tsx. Same panel shape as UnguardedNotice (icon +
// text column, tinted rather than solid-filled) but in the info blue rather than flag red,
// since this is confirming something went right, not warning about a hazard. Only ever
// shows for the beach it was reported on: it's driven by useReportEligibility, which scopes
// its "already reported" check to this beachId specifically. Echoes back the color the user
// reported (not a date — "today" is implicit, this card only ever shows for today's report),
// plus whether that color matched the prediction at the time it was submitted.
export function ReportedTodayNotice({ reported }: ReportedTodayNoticeProps) {
  const { flagColor, agreesWithPrediction } = reported;
  const styles = getReportedTodayNoticeStyles();

  return (
    <div style={styles.panel} role="status">
      <FaCircleInfo style={styles.icon} aria-hidden="true" />
      <div style={styles.textCol}>
        <span style={styles.headline}>Report submitted</span>
        <span style={styles.sentence}>
          Thanks — you reported the flag as {FLAG_LABEL[flagColor]} today.
        </span>
        <span style={styles.sentence}>
          {agreesWithPrediction ? "You agreed with our prediction." : "That's different from our prediction."}
        </span>
      </div>
    </div>
  );
}
