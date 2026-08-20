import type { Beach } from "../../../../shared/types/Beach";

export interface SavedBeachesGridProps {
  beaches: Beach[];
  onPressBeach(beach: Beach): void;
}
