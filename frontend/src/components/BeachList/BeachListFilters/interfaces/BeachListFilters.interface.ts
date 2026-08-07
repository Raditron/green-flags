import type { FlagColor } from "../../../../shared/types/Beach";

export interface BeachListFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFlags: FlagColor[];
  onToggleFlag: (flagColor: FlagColor) => void;
}
