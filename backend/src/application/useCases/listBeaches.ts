import { BeachRepository } from "../../domain/ports/beachRepository";

export interface BeachSummary {
  id: string;
  name: string;
  lat: number;
  long: number;
  quirkNotes?: string;
  mapImageDataUrl?: string;
}

export async function listBeaches(repository: BeachRepository): Promise<BeachSummary[]> {
  const beaches = await repository.listBeaches();

  return beaches.map((beach) => ({
    id: beach.id,
    name: beach.name,
    lat: beach.lat,
    long: beach.long,
    quirkNotes: beach.quirkNotes,
    mapImageDataUrl: beach.mapImage
      ? `data:${beach.mapImage.contentType};base64,${beach.mapImage.data.toString("base64")}`
      : undefined,
  }));
}
