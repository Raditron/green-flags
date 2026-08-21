import { WaterQualityRating } from "../../rules/evaluateWaterQualityRating";

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
  /**
   * The beach's latest RZI-derived water-quality rating (issue #122), refreshed in place by its own
   * ~biweekly batch job (runWaterQualityBatch.ts) rather than every daily run — undefined until the
   * first successful batch run covers this beach, and permanently absent for beaches outside RZI
   * Varna/Burgas's mapped coverage (see rziZoneMapping.ts).
   */
  waterQualityRating?: WaterQualityRating;
}

/** Thrown when a beach id doesn't resolve to a beach document. */
export class BeachNotFoundError extends Error {
  constructor(message = "Beach not found") {
    super(message);
  }
}

export interface BeachRepository {
  listBeaches(): Promise<Beach[]>;
  /** Looks up a single beach by id, or null if no beach with that id exists. */
  findBeachById(beachId: string): Promise<Beach | null>;
  /**
   * Upserts the beach's latest computed water-quality rating in place (runWaterQualityBatch.ts,
   * issue #122) — persisted on the beach document itself, unlike Predictions, since RZI only
   * republishes ~biweekly and only the single latest rating is ever displayed.
   */
  updateWaterQualityRating(beachId: string, rating: WaterQualityRating): Promise<void>;
}
