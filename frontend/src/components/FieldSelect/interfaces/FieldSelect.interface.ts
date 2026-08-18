export interface FieldSelectOption<T extends string> {
  value: T;
  label: string;
}

export interface FieldSelectProps<T extends string> {
  value: T;
  options: readonly FieldSelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  ariaLabel?: string;
}
