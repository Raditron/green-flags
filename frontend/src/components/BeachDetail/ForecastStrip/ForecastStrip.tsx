import { forecastChipLabel, forecastWindowDates, todayInSofia } from "../utils/forecastWindow";
import { ForecastStripChip } from "./ForecastStripChip/ForecastStripChip";
import type { ForecastStripProps } from "./interfaces";
import { getForecastStripStyles } from "./styles/ForecastStrip.styles";

// Renders above Timeline on the beach detail page: a horizontal row of 7 day chips (Today, then
// the next 6 calendar dates in the beach's local time — see forecastWindowDates). Each chip is
// its own component instance fetching independently (see ForecastStripChip). This ticket (#84)
// delivers the row and its per-chip states only; selectedDate/onSelect are accepted now so #85
// only has to wire BeachDetail's own state through, not retrofit interactivity here.
export function ForecastStrip({ beachId, selectedDate, onSelect }: ForecastStripProps) {
  const styles = getForecastStripStyles();
  const dates = forecastWindowDates();
  const today = todayInSofia();

  return (
    <ul style={styles.list}>
      {dates.map((date) => (
        <li key={date} style={styles.item}>
          <ForecastStripChip
            beachId={beachId}
            date={date}
            label={forecastChipLabel(date, today)}
            selected={selectedDate === date}
            onSelect={onSelect ?? (() => {})}
          />
        </li>
      ))}
    </ul>
  );
}
