import { BEACH_AREAS } from "../../../../shared/types/Beach";
import { FieldSelect } from "../../../FieldSelect/FieldSelect";
import type { FieldSelectOption } from "../../../FieldSelect/interfaces/FieldSelect.interface";
import type { SelectedArea } from "../../hooks/useBeachFilters";
import type { AreaSelectProps } from "./interfaces/AreaSelect.interface";

const ALL_AREAS_LABEL = "All Areas";

const areaOptions: FieldSelectOption<SelectedArea>[] = [
  {
    value: "all",
    label: ALL_AREAS_LABEL,
  },
  ...BEACH_AREAS.map((area) => ({
    value: area,
    label: area,
  })),
];

export function AreaSelect({ value, onChange }: AreaSelectProps) {
  return (
    <FieldSelect
      value={value}
      options={areaOptions}
      onChange={onChange}
      ariaLabel="Filter by area"
    />
  );
}
