import type { ViewStyle } from "react-native";

export interface ForecastStripChipProps {
  beachId: string;
  /** Calendar date (YYYY-MM-DD) this chip fetches and represents. */
  date: string;
  /** "Today" for the first chip, otherwise a short Sofia-local weekday name (see forecastChipLabel). */
  label: string;
  selected: boolean;
  onSelect: (date: string) => void;
  /**
   * Style for the item wrapper this chip renders itself into (rather than ForecastStrip wrapping
   * it) — a not-found day renders nothing at all, so the row's flex:1 siblings redistribute the
   * full width evenly instead of leaving a blank slot where a hidden chip would have been.
   */
  itemStyle: ViewStyle;
}
