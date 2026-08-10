import type { FlagColor } from "../../../../shared/types/Beach";
import type { SelectedArea } from "../../hooks/useBeachFilters";

export interface BeachListFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFlags: FlagColor[];
  onToggleFlag: (flagColor: FlagColor) => void;
  selectedArea: SelectedArea;
  onAreaChange: (area: SelectedArea) => void;
  isAreaAutoDetected: boolean;
}
