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
  mapImage: BeachMapImage;
}

export interface BeachRepository {
  listBeaches(): Promise<Beach[]>;
}
