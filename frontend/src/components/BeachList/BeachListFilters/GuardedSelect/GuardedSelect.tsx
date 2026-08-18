import { FieldSelect } from "../../../FieldSelect/FieldSelect";
import type { GuardedSelectProps } from "./interfaces/GuardedSelect.interface";

const GUARDED_OPTIONS = [
  { value: "all", label: "All Beaches" },
  { value: "guarded", label: "Guarded" },
  { value: "unguarded", label: "Unguarded" },
] as const;

export function GuardedSelect({ value, onChange }: GuardedSelectProps) {
  return (
    <FieldSelect
      value={value}
      options={GUARDED_OPTIONS}
      onChange={onChange}
      ariaLabel="Filter by guarded status"
    />
  );
}
