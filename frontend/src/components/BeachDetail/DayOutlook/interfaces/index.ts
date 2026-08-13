export interface DayOutlookProps {
  beachId: string;
  /** Calendar date (YYYY-MM-DD) this outlook summarizes — always a future date; today renders Timeline instead (see #85). */
  date: string;
  isUnguarded?: boolean;
}
