import { BeachAreas } from "../../domain/ports/beachRepository";

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
  /** Coastal municipality (община) this beach sits in — see BeachAreas. */
  area: BeachAreas;
  /**
   * True if this beach has no official lifeguard station at all — see isUnguarded on the domain
   * Beach type. Curated from the Ministry of Tourism's unguarded-beach order (13.07.2026,
   * Т-РД-16-221): set for beaches that exact-match an order entry, plus Durankulak, whose every
   * named order sub-entry is unguarded with no offsetting concession/lease on record; omitted here
   * defaults to false via seedBeaches.ts / mongoBeachRepository.ts. The order's remaining ~90 named
   * beaches don't correspond to any entry in this launch list (finer-grained than this file's
   * whole-resort beaches) — see unguardedBeachSeedData.ts / seedUnguardedBeaches.ts for those.
   */
  isUnguarded?: boolean;
}

/**
 * Founder-curated launch list of 16 beaches (per .scratch/green-flags-mvp/issues/06-beach-seeding.md),
 * expanded to cover every named area on the Bulgarian Black Sea coast (see BeachAreas), north to
 * south, Romanian border at Durankulak to the Turkish border at Rezovo. The added beaches use
 * beach-center approximations for lat/long the same way the original 16 do — adequate for
 * Open-Meteo's model grid resolution, not survey-precision.
 */
export const BEACH_SEED_DATA: BeachSeed[] = [
  {
    id: "durankulak",
    name: "Durankulak",
    lat: 43.6817,
    long: 28.5603,
    quirkNotes: "Northernmost beach, right on the Romanian border",
    order: 0,
    onshoreWindDirectionDeg: 60,
    area: BeachAreas.Shabla,
    // No exact row match, but every Приложение 1 entry under this name (rows 1-2, 4: Дюрankulak
    // - север 1, - север 2, - езеро) is unguarded and none of the order/NCR sources record a
    // concession or lease for Durankulak — same practical status as the exact-match beaches above.
    isUnguarded: true,
  },
  {
    id: "krapets",
    name: "Krapets",
    lat: 43.6144,
    long: 28.5697,
    quirkNotes: "Wide dune beach, largely undeveloped",
    order: 1,
    onshoreWindDirectionDeg: 60,
    area: BeachAreas.Shabla,
  },
  {
    id: "shabla",
    name: "Shabla",
    lat: 43.5411,
    long: 28.5507,
    order: 2,
    onshoreWindDirectionDeg: 65,
    area: BeachAreas.Shabla,
    // Exact match to row 8 of Приложение 1, Заповед № Т-РД-16-221/13.07.2026.
    isUnguarded: true,
  },
  {
    id: "tyulenovo",
    name: "Tyulenovo",
    lat: 43.4589,
    long: 28.5334,
    quirkNotes: "Small cliff-backed cove, popular with divers",
    order: 3,
    onshoreWindDirectionDeg: 65,
    area: BeachAreas.Shabla,
  },
  {
    id: "kavarna",
    name: "Kavarna",
    lat: 43.4325,
    long: 28.3378,
    order: 4,
    onshoreWindDirectionDeg: 70,
    area: BeachAreas.Kavarna,
  },
  {
    id: "kaliakra",
    name: "Kaliakra",
    lat: 43.3663,
    long: 28.4653,
    quirkNotes: "Small coves near the cape, less developed",
    order: 5,
    onshoreWindDirectionDeg: 70,
    area: BeachAreas.Kavarna,
  },
  {
    id: "balchik",
    name: "Balchik",
    lat: 43.4181,
    long: 28.1667,
    quirkNotes: "Beach below the Balchik Palace botanical gardens",
    order: 6,
    onshoreWindDirectionDeg: 70,
    area: BeachAreas.Balchik,
  },
  { id: "albena", name: "Albena", lat: 43.3556, long: 28.0725, order: 7, onshoreWindDirectionDeg: 70, area: BeachAreas.Balchik },
  {
    id: "kranevo-sunny-day",
    name: "Kranevo / Sunny Day",
    lat: 43.3833,
    long: 28.0333,
    order: 8,
    onshoreWindDirectionDeg: 70,
    area: BeachAreas.Balchik,
  },
  {
    id: "golden-sands",
    name: "Golden Sands (Zlatni Pyasatsi)",
    lat: 43.2939,
    long: 28.0345,
    order: 9,
    onshoreWindDirectionDeg: 75,
    area: BeachAreas.Varna,
  },
  {
    id: "sveti-konstantin-i-elena",
    name: "Sveti Konstantin i Elena",
    lat: 43.2325,
    long: 27.9667,
    quirkNotes: "Bulgaria's oldest resort, wooded grounds right up to the beach",
    order: 10,
    onshoreWindDirectionDeg: 72,
    area: BeachAreas.Varna,
  },
  {
    id: "varna-central-beach",
    name: "Varna Central Beach",
    lat: 43.193,
    long: 27.928,
    quirkNotes: "Bay-sheltered, generally calmer than open coast",
    order: 11,
    onshoreWindDirectionDeg: 75,
    area: BeachAreas.Varna,
  },
  {
    id: "byala",
    name: "Byala",
    lat: 42.8825,
    long: 27.8757,
    quirkNotes: "Open coast, more swell-exposed",
    order: 12,
    onshoreWindDirectionDeg: 90,
    area: BeachAreas.Byala,
  },
  { id: "obzor", name: "Obzor", lat: 42.8214, long: 27.8814, order: 13, onshoreWindDirectionDeg: 90, area: BeachAreas.Nessebar },
  {
    id: "irakli",
    name: "Irakli",
    lat: 42.73,
    long: 27.75,
    quirkNotes: "Wild/undeveloped, multiple independently-staffed outposts — predicted at whole-beach level",
    order: 14,
    onshoreWindDirectionDeg: 100,
    area: BeachAreas.Nessebar,
    // Exact match to Приложение 2, item 2 ("Иракли", община Несебър), same order.
    isUnguarded: true,
  },
  {
    id: "elenite",
    name: "Elenite",
    lat: 42.7086,
    long: 27.7503,
    order: 15,
    onshoreWindDirectionDeg: 100,
    area: BeachAreas.Nessebar,
    // Exact match to row 47 of Приложение 1 ("Елените 1 и Елените 2").
    isUnguarded: true,
  },
  { id: "sveti-vlas", name: "Sveti Vlas", lat: 42.6989, long: 27.7539, order: 16, onshoreWindDirectionDeg: 100, area: BeachAreas.Nessebar },
  {
    id: "sunny-beach-central",
    name: "Sunny Beach (central)",
    lat: 42.6833,
    long: 27.7167,
    quirkNotes: "Large multi-outpost beach — same whole-beach caveat as Irakli",
    order: 17,
    onshoreWindDirectionDeg: 95,
    area: BeachAreas.Nessebar,
  },
  {
    id: "nessebar-south-beach",
    name: "Nessebar (south beach)",
    lat: 42.655,
    long: 27.735,
    order: 18,
    onshoreWindDirectionDeg: 110,
    area: BeachAreas.Nessebar,
  },
  { id: "ravda", name: "Ravda", lat: 42.6167, long: 27.6833, order: 19, onshoreWindDirectionDeg: 115, area: BeachAreas.Nessebar },
  { id: "pomorie", name: "Pomorie", lat: 42.5583, long: 27.6417, order: 20, onshoreWindDirectionDeg: 120, area: BeachAreas.Pomorie },
  {
    id: "burgas-central-beach",
    name: "Burgas Central Beach",
    lat: 42.488,
    long: 27.49,
    order: 21,
    onshoreWindDirectionDeg: 140,
    area: BeachAreas.Burgas,
  },
  {
    id: "chernomorets",
    name: "Chernomorets",
    lat: 42.4436,
    long: 27.6386,
    order: 22,
    onshoreWindDirectionDeg: 130,
    area: BeachAreas.Sozopol,
  },
  { id: "sozopol", name: "Sozopol", lat: 42.4167, long: 27.7, order: 23, onshoreWindDirectionDeg: 115, area: BeachAreas.Sozopol },
  {
    id: "dyuni",
    name: "Dyuni",
    lat: 42.3853,
    long: 27.7159,
    quirkNotes: "Enclosed resort complex on its own peninsula",
    order: 24,
    onshoreWindDirectionDeg: 112,
    area: BeachAreas.Sozopol,
  },
  { id: "primorsko", name: "Primorsko", lat: 42.2611, long: 27.7583, order: 25, onshoreWindDirectionDeg: 110, area: BeachAreas.Primorsko },
  { id: "kiten", name: "Kiten", lat: 42.2167, long: 27.7667, order: 26, onshoreWindDirectionDeg: 110, area: BeachAreas.Primorsko },
  {
    id: "lozenets",
    name: "Lozenets",
    lat: 42.1994,
    long: 27.8264,
    order: 27,
    onshoreWindDirectionDeg: 110,
    area: BeachAreas.Tsarevo,
  },
  {
    id: "tsarevo",
    name: "Tsarevo",
    lat: 42.1667,
    long: 27.85,
    order: 28,
    onshoreWindDirectionDeg: 120,
    area: BeachAreas.Tsarevo,
  },
  {
    id: "sinemorets",
    name: "Sinemorets",
    lat: 42.0667,
    long: 27.9833,
    quirkNotes: "Closest to Strandzha/Turkish border of the wide beaches",
    order: 29,
    onshoreWindDirectionDeg: 130,
    area: BeachAreas.Tsarevo,
  },
  {
    id: "ahtopol",
    name: "Ahtopol",
    lat: 42.0975,
    long: 27.9309,
    order: 30,
    onshoreWindDirectionDeg: 125,
    area: BeachAreas.Tsarevo,
  },
  {
    id: "rezovo",
    name: "Rezovo",
    lat: 42.0025,
    long: 27.9686,
    quirkNotes: "Southernmost beach, on the Turkish border at the Rezovska river mouth",
    order: 31,
    onshoreWindDirectionDeg: 130,
    area: BeachAreas.Tsarevo,
    // Exact match to row 91 of Приложение 1 ("Резово").
    isUnguarded: true,
  },
];
