import type { HourlyPrediction } from "../../../interfaces";

export interface TimePickerProps {
  hourlyPredictions: HourlyPrediction[];
  selectedHour: number | null;
  currentHour: number | null;
  onPick: (hour: number) => void;
  onClose: () => void;
}
