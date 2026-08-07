import type { FlagColor } from "../../interfaces";

export interface BeachListFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFlags: FlagColor[];
  onToggleFlag: (flagColor: FlagColor) => void;
}
