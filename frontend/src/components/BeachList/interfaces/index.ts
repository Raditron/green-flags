export type FlagColor = "green" | "yellow" | "red";

export interface BeachSummary {
  id: string;
  name: string;
  lat: number;
  long: number;
  quirkNotes?: string;
  mapImageDataUrl?: string;
  currentFlagColor?: FlagColor;
  currentConfidencePercent?: number;
}

export interface BeachListResponse {
  beaches: BeachSummary[];
}
