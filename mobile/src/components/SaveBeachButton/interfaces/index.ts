// Mirrors frontend's SaveBeachButton/interfaces/index.ts, minus `withLabel` — mobile has nowhere
// yet that needs the labelled ("Save"/"Saved" caption) variant frontend's list-card actions row
// uses; the Beaches tab list card (BeachListCard.tsx) uses this icon-only variant as a corner
// overlay instead. Revisit if a future ticket wants the labelled caption on mobile too.
export interface SaveBeachButtonProps {
  beachId: string;
  /** Fired on every toggle tap (while signed in) with the beach's new saved state. Lets a screen
   * react to a save/unsave — e.g. BeachDetail's save-confirmation toast — without baking that
   * side effect into this otherwise-reusable toggle; callers that don't need it (the Saved tab's
   * grid, which only ever unsaves through this button) simply omit it. */
  onToggle?(saved: boolean): void;
}
