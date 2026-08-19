import type { AreaAverageAttributes, AverageAttributes } from "../../interfaces";

export interface DashboardSummaryProps {
  date: string;
  bySea: AverageAttributes;
  byArea: AreaAverageAttributes[];
}
