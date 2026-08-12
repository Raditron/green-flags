import { FaFlag } from "react-icons/fa6";
import { getFlagStatusText } from "../../../../shared/styles/flagColor";
import { conditionsSentence, RIP_CURRENT_CAUTION } from "../conditionsCopy";
import type { VerdictProps } from "./interfaces";
import { getVerdictStyles } from "./styles/Verdict.styles";

// The single-glance answer to "should I go in, and how will it feel" for the selected
// hour — flag status, a plain-language conditions sentence, and a rip-current caution
// when it's actually warranted. Everything else in Timeline (time picker, confidence
// ring, itemized wind/sea rows, the "report the flag" picker) is supporting detail for
// someone who wants to know why, not the first thing they read — see ReportFlagPanel,
// which Timeline renders as its own card below this one rather than inset in here, so
// this panel stays just the flag-color verdict.
export function Verdict({ prediction, desaturated = false }: VerdictProps) {
  if (!prediction) return null;

  const styles = getVerdictStyles({ flagColor: prediction.flagColor, desaturated });
  const headline = getFlagStatusText(prediction.flagColor) ?? "Conditions estimate";
  const caution = RIP_CURRENT_CAUTION[prediction.ripCurrentRisk];

  return (
    <div style={styles.panel} role="status">
      <FaFlag style={styles.icon} aria-hidden="true" />
      <div style={styles.textCol}>
        <span style={styles.headline}>{headline}</span>
        <span style={styles.sentence}>{conditionsSentence(prediction)}</span>
        {caution && <span style={styles.caution}>{caution}</span>}
      </div>
    </div>
  );
}
