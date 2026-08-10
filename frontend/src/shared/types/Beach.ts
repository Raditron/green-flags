export type FlagColor = "green" | "yellow" | "red";

/**
 * Coastal municipality a beach sits in, north to south, Romanian to Turkish border, matching the
 * backend's BeachAreas enum. See CONTEXT.md's "Area".
 */
export const BEACH_AREAS = [
  "Shabla",
  "Kavarna",
  "Balchik",
  "Varna",
  "Avren",
  "Dolni Chiflik",
  "Byala",
  "Nessebar",
  "Pomorie",
  "Burgas",
  "Sozopol",
  "Primorsko",
  "Tsarevo",
] as const;

export type BeachArea = (typeof BEACH_AREAS)[number];

export interface Beach {
  id: string;
  name: string;
  lat: number;
  long: number;
  quirkNotes?: string;
  mapImageDataUrl?: string;
  currentFlagColor?: FlagColor;
  currentConfidencePercent?: number;
  area: BeachArea;
  isUnguarded: boolean;
}

/** A Beach annotated with its Distance from the visitor; undefined when the visitor's location isn't known. See CONTEXT.md's "Distance". */
export interface BeachWithDistance extends Beach {
  distanceKm?: number;
}
