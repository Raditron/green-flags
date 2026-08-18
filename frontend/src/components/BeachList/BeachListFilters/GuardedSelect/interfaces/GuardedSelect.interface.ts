export type GuardedFilter = "all" | "guarded" | "unguarded";

export interface GuardedSelectProps {
  value: GuardedFilter;
  onChange: (value: GuardedFilter) => void;
}
