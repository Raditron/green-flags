import { ReportPrompt } from "../ReportPrompt/ReportPrompt";
import type { ReportFlagPanelProps } from "./interfaces";
import { getReportFlagPanelStyles } from "./styles/ReportFlagPanel.styles";

// Rendered under Verdict (see Timeline.tsx) rather than inset inside it — voting on a
// wrong-looking flag is still a single click away, it just no longer has to share Verdict's
// solid flag-color panel to get there. No intro line of its own: ReportPrompt's "What color
// is the flag right now?" heading already carries that job now that this is its own card
// rather than something needing to be pointed at from inside Verdict. Timeline only renders
// this at all once useReportFlag says picking a color is actually possible right now.
export function ReportFlagPanel({ submitting, error, onPick }: ReportFlagPanelProps) {
  const styles = getReportFlagPanelStyles();

  return (
    <div style={styles.panel}>
      {error && <p style={styles.error}>{error}</p>}
      <ReportPrompt submitting={submitting} onPick={onPick} />
    </div>
  );
}
