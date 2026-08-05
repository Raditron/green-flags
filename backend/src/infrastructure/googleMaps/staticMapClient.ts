import { BeachMapImage } from "../../domain/ports/beachRepository";

const STATIC_MAP_ENDPOINT = "https://maps.googleapis.com/maps/api/staticmap";

export async function fetchStaticMapPin(lat: number, long: number, apiKey: string): Promise<BeachMapImage> {
  const url = new URL(STATIC_MAP_ENDPOINT);
  url.searchParams.set("center", `${lat},${long}`);
  url.searchParams.set("zoom", "14");
  url.searchParams.set("size", "160x160");
  url.searchParams.set("markers", `color:red|${lat},${long}`);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Google Static Maps request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "image/png";
  const arrayBuffer = await response.arrayBuffer();

  return { data: Buffer.from(arrayBuffer), contentType };
}
