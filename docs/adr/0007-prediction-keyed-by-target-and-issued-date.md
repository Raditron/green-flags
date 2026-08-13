# Predictions are keyed by (beach, target date, issued date), with lead tier derived at read time

With the 7-day forecast, a single target date accumulates one Prediction per day it sits inside the
rolling window before it arrives — so `(beachId, date)` no longer uniquely identifies a Prediction.
We key on the two raw dates (`targetDate`, `issuedDate`) instead of storing `leadDays` or `leadTier`
directly, and derive both as pure functions of the two dates wherever they're needed (confidence
calibration, reconciliation).

We considered storing `leadTier` directly for query simplicity, but rejected it: the whole point of
accumulating this data is to eventually build an empirical accuracy curve broken down by lead, and
rounding lead down to a coarse tier at write time would permanently destroy the precision needed to
do that. The tier boundaries (currently near 0-1 / mid 2-4 / far 5-6 days) are themselves a
placeholder flagged for retuning once real reconciliation data exists — retuning them should cost
nothing, not require a migration.
