// RN port of frontend/src/shared/types/Beach.ts, verbatim — the canonical Area/flag-color
// vocabulary every later mobile issue (#96 Beaches list, #97-99 Beach Detail, #100 Saved) also
// needs, so it lives here at the shared top level (not colocated under Dashboard/) from the start.
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
  /** Sofia-local date (YYYY-MM-DD) the batch actually computed the displayed prediction on; mirrors the backend's BeachSummary.issuedDate. Not consumed by any UI yet. */
  issuedDate?: string;
  area: BeachArea;
  isUnguarded: boolean;
}

/** A Beach annotated with its Distance from the visitor; undefined when the visitor's location isn't known. See CONTEXT.md's "Distance". */
export interface BeachWithDistance extends Beach {
  distanceKm?: number;
}
