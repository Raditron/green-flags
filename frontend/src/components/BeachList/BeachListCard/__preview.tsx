// TEMP: visual QA harness for issue #14, not part of the feature. Deleted after screenshotting.
import { BeachListCard } from "./BeachListCard";
import type { Beach } from "../../../shared/types/Beach";

const mockBeaches: Beach[] = [
  {
    id: "1",
    name: "Sunset Cove",
    mapImageDataUrl:
      "data:image/svg+xml;base64," +
      btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#8da9c4"/><circle cx="60" cy="60" r="30" fill="#f9fbfc"/></svg>'
      ),
    currentFlagColor: "green",
    currentConfidencePercent: 92,
  },
  {
    id: "2",
    name: "Windy Point",
    currentFlagColor: "yellow",
    currentConfidencePercent: 61,
  },
  {
    id: "3",
    name: "Harborview Beach With A Genuinely Long Name",
    mapImageDataUrl:
      "data:image/svg+xml;base64," +
      btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#134074"/><rect x="20" y="20" width="80" height="80" fill="#eef4ed"/></svg>'
      ),
  },
  {
    id: "4",
    name: "Red Rock Bay",
    currentFlagColor: "red",
    currentConfidencePercent: 88,
  },
];

export function BeachListCardPreview() {
  return (
    <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
      {mockBeaches.map(beach => (
        <BeachListCard key={beach.id} beach={beach} />
      ))}
    </ul>
  );
}
