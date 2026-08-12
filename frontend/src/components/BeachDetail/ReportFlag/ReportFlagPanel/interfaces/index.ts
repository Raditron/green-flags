import type { FlagColor } from "../../../../../shared/types/Beach";

export interface ReportFlagPanelProps {
  submitting: boolean;
  // Set only while a just-submitted report is being shown back as failed — cleared
  // automatically a few seconds later by useReportFlag so the picker becomes retryable.
  error?: string;
  onPick: (flagColor: FlagColor) => void;
}
