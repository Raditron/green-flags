import { FaCircleInfo } from "react-icons/fa6";
import { getWorstAroundNoticeStyles } from "./styles/WorstAroundNotice.styles";

interface WorstAroundNoticeProps {
  hour: number;
}

// Sits directly under Verdict's flag panel, same spot Timeline's plain-text "Updated HH:MM"
// caption occupies — but framed as its own info bubble (same tinted-panel treatment as
// ReportedTodayNotice) rather than a bare <p>, since "why this flag" deserves the same visual
// weight as "your report went through" instead of reading as an afterthought caption.
export function WorstAroundNotice({ hour }: WorstAroundNoticeProps) {
  const styles = getWorstAroundNoticeStyles();

  return (
    <div style={styles.panel} role="status">
      <FaCircleInfo style={styles.icon} aria-hidden="true" />
      <span style={styles.sentence}>Worst around {String(hour).padStart(2, "0")}:00</span>
    </div>
  );
}
