export interface ForecastStripChipProps {
  beachId: string;
  /** Calendar date (YYYY-MM-DD) this chip fetches and represents. */
  date: string;
  /** "Today" for the first chip, otherwise a short Sofia-local weekday name (see forecastChipLabel). */
  label: string;
  selected: boolean;
  onSelect: (date: string) => void;
}
