// Orchestration errors raised by the submitReport use case — none of these are repository/port
// contract failures, so they live beside the use case rather than in domain/ports.

/** Thrown for a beach with no official lifeguard station — there's no lifeguard-raised flag to report on. */
export class BeachUnguardedError extends Error {
  constructor(message = "This beach has no lifeguard coverage — flag reports aren't collected here") {
    super(message);
  }
}
/** Thrown outside the June-September lifeguard season (see .scratch/green-flags-mvp/issues/08-feedback-window-and-off-season.md). */
export class OutsideSeasonError extends Error {
  constructor(message = "Feedback is closed for the season — beach lifeguard coverage runs June through September") {
    super(message);
  }
}
/** Thrown within season but outside the daily 09:00-18:30 window. */
export class OutsideWindowError extends Error {
  constructor(message = "Outside legal hours") {
    super(message);
  }
}
/** Thrown when the batch job hasn't yet persisted a prediction for this beach/date/hour to compare the report against. */
export class NoPredictionAvailableError extends Error {
  constructor(message = "No prediction available for this beach right now") {
    super(message);
  }
}
