import type { FlagColor } from "../../../../shared/types/Beach";

/**
 * The flag color a user reported today, plus whether it matched the prediction at submission
 * time — this pair always travels together (the report-status response, the "already reported"
 * eligibility state, the confirmation notice), so it gets its own type rather than two
 * independently-optional fields repeated at every site.
 */
export interface ReportedFlag {
  flagColor: FlagColor;
  agreesWithPrediction: boolean;
}
