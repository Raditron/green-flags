export interface StormWarningProvider {
  /** Whether an official storm/severe-weather warning is active on the Bulgarian coast at the given instant. */
  checkActiveStormWarning(now: Date): Promise<boolean>;
}
