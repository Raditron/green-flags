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
}

export interface BeachRepository {
  listBeaches(): Promise<Beach[]>;
}
