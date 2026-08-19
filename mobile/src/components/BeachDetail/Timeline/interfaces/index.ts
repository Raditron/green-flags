import type { HourlyPrediction } from "../../interfaces";

export interface TimelineProps {
  hourlyPredictions: HourlyPrediction[];
  desaturated?: boolean;
  currentHour?: number | null;
  isUnguarded?: boolean;
  // frontend's TimelineProps also carries `beachId` and `updatedAt` here — beachId for the
  // report-the-flag entry point (#98) and updatedAt for the SWR "last refreshed" caption (dropped
  // along with usePredictions' cache, see its doc comment). Both come back once #98 needs them.
}
