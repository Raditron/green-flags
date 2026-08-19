export interface ForecastStripProps {
  beachId: string;
  /** Selected chip's date (YYYY-MM-DD), if any. ForecastStrip is presentational — wiring this to Timeline/Day Outlook selection is BeachDetail.tsx's job. */
  selectedDate?: string;
  onSelect?: (date: string) => void;
}
