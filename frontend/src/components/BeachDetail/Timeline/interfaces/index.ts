import type { HourlyPrediction } from "../../interfaces";

export interface TimelineProps {
  hourlyPredictions: HourlyPrediction[];
  desaturated?: boolean;
  currentHour?: number | null;
  updatedAt?: string;
  isUnguarded?: boolean;
}
