# Feedback collection window and off-season behavior

Type: grilling
Status: resolved

## Question

Since [Bulgarian flag legal criteria](02-bulgarian-flag-legal-criteria.md) found flags only legally exist during a guaranteed window (daily 09:00-18:30, June 1-Sept 30) on guarded beaches, should user feedback collection be open at all times, or restricted to when a real physical flag exists to compare against? What should the app show/do outside that window?

## Answer

Green Flags carries no legal obligation here — it's a community-tuned, unofficial prediction/reporting tool, the same position Waze takes on its own crowdsourced reports (not liable if a prediction turns out wrong, since it's explicitly user-driven, not an official notice).

That said, feedback collection is restricted to the legally-guaranteed flag window (09:00-18:30, June 1-Sept 30) — daily off-hours and the Oct-May off-season alike — because outside that window there is no lifeguard-raised flag for a user to actually observe. Accepting feedback then would be pure noise with no ground truth behind it, and would corrupt the calibration layer from [Prediction model architecture](01-prediction-model-architecture.md).

- **Within season, outside daily hours (before 09:00 / after 18:30):** feedback submission is disabled; the prediction can still be shown (useful for trip planning) but isn't collecting corrections.
- **Off-season (Oct-May):** feedback submission is disabled entirely, with a friendly in-app message rather than a bare error — something like "Feedback is closed for the season — beach lifeguard coverage runs June through September" (exact copy is a later UI-polish detail, not locked here).

Still open (minor, UI-detail fog): whether the prediction display itself should carry a different label/tone off-season (e.g. "unofficial, no lifeguard on duty") versus looking identical to an in-season prediction — folds into the existing "UI/UX design of the prediction display" fog item.
