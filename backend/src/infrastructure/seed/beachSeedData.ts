export interface BeachSeed {
  id: string;
  name: string;
  lat: number;
  long: number;
  quirkNotes?: string;
  order: number;
  /**
   * Compass bearing the wind blows FROM when blowing straight onshore at this beach, feeding the
   * rule engine's rip-current risk (see evaluateHourlyFlag.ts). Approximated from each beach's
   * coastline orientation on a map, since no survey data exists — reasonable for MVP given
   * rip-current risk is already a project-derived heuristic (no Black Sea rip-current feed exists
   * at any price, per .scratch/green-flags-mvp/research/03-bulgarian-coast-weather-apis.md).
   * Flagged for refinement, same as the rip-current thresholds themselves.
   */
  onshoreWindDirectionDeg: number;
}

/**
 * Founder-curated launch list of 16 beaches, north to south, per
 * .scratch/green-flags-mvp/issues/06-beach-seeding.md.
 */
export const BEACH_SEED_DATA: BeachSeed[] = [
  {
    id: "varna-central-beach",
    name: "Varna Central Beach",
    lat: 43.193,
    long: 27.928,
    quirkNotes: "Bay-sheltered, generally calmer than open coast",
    order: 0,
    onshoreWindDirectionDeg: 75,
  },
  { id: "golden-sands", name: "Golden Sands (Zlatni Pyasatsi)", lat: 43.2939, long: 28.0345, order: 1, onshoreWindDirectionDeg: 75 },
  { id: "albena", name: "Albena", lat: 43.3556, long: 28.0725, order: 2, onshoreWindDirectionDeg: 70 },
  { id: "kranevo-sunny-day", name: "Kranevo / Sunny Day", lat: 43.3833, long: 28.0333, order: 3, onshoreWindDirectionDeg: 70 },
  {
    id: "byala",
    name: "Byala",
    lat: 42.8825,
    long: 27.8757,
    quirkNotes: "Open coast, more swell-exposed",
    order: 4,
    onshoreWindDirectionDeg: 90,
  },
  { id: "obzor", name: "Obzor", lat: 42.8214, long: 27.8814, order: 5, onshoreWindDirectionDeg: 90 },
  {
    id: "irakli",
    name: "Irakli",
    lat: 42.73,
    long: 27.75,
    quirkNotes: "Wild/undeveloped, multiple independently-staffed outposts — predicted at whole-beach level",
    order: 6,
    onshoreWindDirectionDeg: 100,
  },
  { id: "sveti-vlas", name: "Sveti Vlas", lat: 42.6989, long: 27.7539, order: 7, onshoreWindDirectionDeg: 100 },
  {
    id: "sunny-beach-central",
    name: "Sunny Beach (central)",
    lat: 42.6833,
    long: 27.7167,
    quirkNotes: "Large multi-outpost beach — same whole-beach caveat as Irakli",
    order: 8,
    onshoreWindDirectionDeg: 95,
  },
  { id: "nessebar-south-beach", name: "Nessebar (south beach)", lat: 42.655, long: 27.735, order: 9, onshoreWindDirectionDeg: 110 },
  { id: "pomorie", name: "Pomorie", lat: 42.5583, long: 27.6417, order: 10, onshoreWindDirectionDeg: 120 },
  { id: "burgas-central-beach", name: "Burgas Central Beach", lat: 42.488, long: 27.49, order: 11, onshoreWindDirectionDeg: 140 },
  { id: "sozopol", name: "Sozopol", lat: 42.4167, long: 27.7, order: 12, onshoreWindDirectionDeg: 115 },
  { id: "primorsko", name: "Primorsko", lat: 42.2611, long: 27.7583, order: 13, onshoreWindDirectionDeg: 110 },
  { id: "kiten", name: "Kiten", lat: 42.2167, long: 27.7667, order: 14, onshoreWindDirectionDeg: 110 },
  {
    id: "sinemorets",
    name: "Sinemorets",
    lat: 42.0667,
    long: 27.9833,
    quirkNotes: "Furthest south, closest to Strandzha/Turkish border",
    order: 15,
    onshoreWindDirectionDeg: 130,
  },
];
