import type { SelectedArea } from "../../../hooks/useBeachFilters";

export interface AreaSelectProps {
  value: SelectedArea;
  onChange: (area: SelectedArea) => void;
}
