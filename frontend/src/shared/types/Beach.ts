export type FlagColor = "green" | "yellow" | "red";

export interface Beach {
  id: string;
  name: string;
  lat: number;
  long: number;
  quirkNotes?: string;
  mapImageDataUrl?: string;
  currentFlagColor?: FlagColor;
  currentConfidencePercent?: number;
}
