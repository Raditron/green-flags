import type { HourlyPrediction } from "../../../interfaces";

export interface VerdictProps {
  prediction?: HourlyPrediction;
  desaturated?: boolean;
}
