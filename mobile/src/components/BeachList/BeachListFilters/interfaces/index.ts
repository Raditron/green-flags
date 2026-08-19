import type { FlagColor } from "../../../../shared/types/Beach";
import type { SelectedArea } from "../../hooks/useBeachFilters";

export interface BeachListFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  // Single-select, matching useBeachFilters' `selectedFlag` — see that hook's doc comment for
  // why this diverges from frontend's multi-select `selectedFlags`/`onToggleFlag`.
  selectedFlag: FlagColor | null;
  onSelectFlag: (flagColor: FlagColor | null) => void;
  selectedArea: SelectedArea;
  onAreaChange: (area: SelectedArea) => void;
  isAreaAutoDetected: boolean;
  onClearFilters: () => void;
}
