import { buildMonthWithDateReadable } from "../../../../shared/data/utils/toTimeReadable";
import { flagColorVar, getFlagStatusText } from "../../../../shared/styles/flagColor";
import { usePredictions } from "../../hooks/usePredictions";
import { worstCaseHour } from "../../utils/worstCaseHour";
import type { ForecastStripChipProps } from "./interfaces";
import { getForecastStripChipStyles } from "./styles/ForecastStripChip.styles";

// One chip = one independent usePredictions(beachId, date) call, so a slow or failed fetch for
// one day never blocks or alters its six siblings — this has to be its own component (rather than
// a loop body inside ForecastStrip) because React hooks can't be called a variable number of
// times within a single component's render.
export function ForecastStripChip({ beachId, date, label, selected, onSelect, itemStyle }: ForecastStripChipProps) {
  const predictions = usePredictions(beachId, date);

  // A 404 means the day is outside the marine wave-data horizon (#87) — there's nothing to show
  // for it at all, not even a muted placeholder, so the chip renders no <li> here rather than an
  // empty flex slot ForecastStrip would otherwise leave in the row. Because that <li> lives here
  // rather than in ForecastStrip's .map, the remaining chips' flex:1 fills the freed-up width
  // instead of leaving a blank gap — the row looks the same whether it has 6 chips or 7.
  if (predictions.status === "not-found") return null;

  // "error" folds into the same muted "failed" look as a genuinely absent day — from a visitor's
  // perspective there's simply no day to view yet, same reasoning DayOutlook uses for its two
  // messages. A success response with no in-window hour also has nothing worth showing.
  const worst = predictions.status === "success" ? worstCaseHour(predictions.data.hourlyPredictions) : null;
  const state = predictions.status === "loading" ? "pending" : worst ? "resolved" : "failed";
  const styles = getForecastStripChipStyles({ state, selected });
  const dotBackground = worst ? flagColorVar(worst.flagColor) : styles.dot.background;
  const readableDate = buildMonthWithDateReadable({ date });
  const accessibleName =
    state === "pending"
      ? `${label}: loading forecast`
      : state === "failed"
        ? `${label}: forecast unavailable`
        : `${label}: ${getFlagStatusText(worst?.flagColor) ?? label}`;

  return (
    <li style={itemStyle}>
      <button
        type="button"
        style={styles.button}
        aria-pressed={selected}
        aria-busy={state === "pending"}
        aria-label={accessibleName}
        disabled={state === "failed"}
        onClick={() => onSelect(date)}
      >
        <span style={{ ...styles.dot, background: dotBackground }} aria-hidden="true" />
        <span style={styles.label}>{label}</span>
        <span style={styles.date}>{readableDate}</span>
      </button>
    </li>
  );
}
