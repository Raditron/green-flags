/**
 * Coastal municipalities (общини) along the Bulgarian Black Sea coast, north to south
 * (Romanian border to the Turkish border). Matches the "Община" column used by the Ministry of
 * Tourism's unguarded-beach orders (see .scratch/green-flags-mvp — seedUnguardedBeaches.ts) — each
 * Beach sits within exactly one of these, though many beaches share a municipality.
 */
export enum BeachAreas {
  Shabla = "Shabla",
  Kavarna = "Kavarna",
  Balchik = "Balchik",
  Varna = "Varna",
  Avren = "Avren",
  DolniChiflik = "Dolni Chiflik",
  Byala = "Byala",
  Nessebar = "Nessebar",
  Pomorie = "Pomorie",
  Burgas = "Burgas",
  Sozopol = "Sozopol",
  Primorsko = "Primorsko",
  Tsarevo = "Tsarevo",
}

export interface BeachMapImage {
  data: Buffer;
  contentType: string;
}

export interface Beach {
  id: string;
  name: string;
  lat: number;
  long: number;
  quirkNotes?: string;
  mapImage?: BeachMapImage;
  /** Compass bearing the wind blows FROM when blowing straight onshore at this beach; feeds the rule engine's rip-current risk. */
  onshoreWindDirectionDeg: number;
  area : BeachAreas;
  /**
   * True for beaches with no official lifeguard station at all (in or out of season) — as opposed
   * to the legal window/season in legalWindow.ts, which describes *when* a guarded beach is staffed.
   * Surfaced to the frontend so it can label the flag as a prediction only, and blocks feedback
   * submission in submitReport.ts since there's no lifeguard-raised flag to report on.
   */
  isUnguarded: boolean;
}

export interface BeachRepository {
  listBeaches(): Promise<Beach[]>;
}
