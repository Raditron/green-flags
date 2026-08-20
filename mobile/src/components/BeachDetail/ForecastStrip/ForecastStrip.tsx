import { View } from "react-native";
import { forecastChipLabel, forecastWindowDates, todayInSofia } from "../utils/forecastWindow";
import { ForecastStripChip } from "./ForecastStripChip/ForecastStripChip";
import type { ForecastStripProps } from "./interfaces";
import { getForecastStripStyles } from "./styles/ForecastStrip.styles";

// RN port of frontend's ForecastStrip.tsx: a horizontal row of 7 day chips (Today, then the next 6
// calendar dates in the beach's local time — see forecastWindowDates). Each chip is its own
// component instance fetching independently (see ForecastStripChip). selectedDate/onSelect let
// BeachDetail.tsx swap Timeline for that day's Day Outlook — see #97's acceptance criteria.
export function ForecastStrip({ beachId, selectedDate, onSelect }: ForecastStripProps) {
  const styles = getForecastStripStyles();
  const dates = forecastWindowDates();
  const today = todayInSofia();

  return (
    <View style={styles.list}>
      {dates.map((date) => (
        <ForecastStripChip
          key={date}
          beachId={beachId}
          date={date}
          label={forecastChipLabel(date, today)}
          selected={selectedDate === date}
          onSelect={onSelect ?? (() => {})}
          itemStyle={styles.item}
        />
      ))}
    </View>
  );
}
