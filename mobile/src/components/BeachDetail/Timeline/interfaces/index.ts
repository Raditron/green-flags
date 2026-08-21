import type { HourlyPrediction } from "../../interfaces";

export interface TimelineProps {
  beachId: string;
  hourlyPredictions: HourlyPrediction[];
  desaturated?: boolean;
  currentHour?: number | null;
  isUnguarded?: boolean;
  // Fired once, the moment a report submission succeeds — BeachDetail uses it to fire a toast,
  // mirroring how it already owns SaveBeachButton's onToggle-driven save toast rather than
  // Timeline reaching for useToast itself. A deliberate mobile-only addition: frontend's own
  // report flow doesn't toast on success (see useReportFlag.ts's doc comment on why not — the
  // inline ReportedTodayNotice already confirms it without one).
  onReportSubmitted?: () => void;
  // frontend's TimelineProps also carries `updatedAt` here, for the SWR "last refreshed" caption
  // — dropped along with usePredictions' cache, see its doc comment. Comes back if a later issue
  // needs it.
}
