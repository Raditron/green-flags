export interface BeachSummary {
  id: string;
  name: string;
  lat: number;
  long: number;
  quirkNotes?: string;
  mapImageDataUrl?: string;
}

export interface BeachListResponse {
  beaches: BeachSummary[];
}
