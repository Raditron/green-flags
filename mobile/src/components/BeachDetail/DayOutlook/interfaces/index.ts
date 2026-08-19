export interface DayOutlookProps {
  beachId: string;
  /** Calendar date (YYYY-MM-DD) this outlook summarizes — always a future date; today renders Timeline instead. */
  date: string;
  isUnguarded?: boolean;
}
