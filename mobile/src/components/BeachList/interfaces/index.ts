import type { Beach } from "../../../shared/types/Beach";

// RN port of frontend/src/components/BeachList/interfaces/index.ts, verbatim.
export type { Beach, FlagColor } from "../../../shared/types/Beach";

export interface BeachListResponse {
  beaches: Beach[];
}
