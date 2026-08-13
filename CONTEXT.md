# Green Flags

Helps beach-goers on the Bulgarian Black Sea coast see the predicted water-safety flag for each
beach before they go, and report what they actually saw once there.

## Language

**Area**:
One of the 13 coastal municipalities (общини) the Bulgarian coast is divided into, north to south
from the Romanian to the Turkish border (Shabla, Kavarna, Balchik, Varna, Avren, Dolni Chiflik,
Byala, Nessebar, Pomorie, Burgas, Sozopol, Primorsko, Tsarevo). Every beach sits in exactly one
Area; many beaches share an Area.
_Avoid_: Municipality, region, община (used only for the underlying government data source)

**Selected Area**:
The Area (or "All Areas") the beach list is currently filtered to; search and flag-color filtering
both apply *within* it. Starts as the Detected Area, falling back to "All Areas".
_Avoid_: Current area, active filter

**Detected Area**:
The Area of the visitor's nearest beach, from their browser location, if that beach is within
50 km — used only as Selected Area's starting point, never persisted or recomputed after load.
_Avoid_: User's area, current location, geolocated area

**All Areas**:
The no-filter state of Selected Area — every beach is shown regardless of Area.
_Avoid_: No area, unfiltered

**Distance**:
The straight-line distance from the visitor's browser location to a beach, shown on that beach's
card whenever the location is known — independent of the Detected Area's 50 km cutoff.
_Avoid_: Distance away, proximity

**Comment**:
A free-text note a signed-in User attaches to a Beach, visible to every visitor (signed in or not)
on that beach's details page, newest first. Only its author may delete it; there is no edit.
Distinct from a flag-color report — a Comment carries no water-safety judgment of its own.
_Avoid_: Review, feedback, post

**Forecast Strip**:
The row of 7 day chips (Today, then the next 6 calendar dates) shown above the Timeline on a
beach's details page. Selecting a chip switches which day's forecast the page below it shows —
Today selects the Timeline, any other chip selects that day's Day Outlook. Distinct from the
Timeline itself, which only ever concerns today.
_Avoid_: Date picker, day selector

**Day Outlook**:
A future day's forecast, collapsed to its single worst-case hour and shown in place of the
Timeline once that day's Forecast Strip chip is selected. Reuses the Timeline's own Verdict and
confidence-ring presentation, but has no live clock, hour picker, or flag-reporting — those only
make sense for today, which the Timeline still handles unchanged.
_Avoid_: Forecast detail, day view

## Forecasting

Backend domain vocabulary for the 7-day rolling forecast (see ADRs `0007`-`0009`). Distinct from
this document's "Language" terms above, which describe how the forecast is surfaced in the UI.

**Prediction**:
A flag color and confidence the batch issues for one beach and one target date. A target date
accumulates one Prediction per day it sits inside the rolling 7-day window before it arrives — each
day's issuance is kept, never overwritten, identified by `(beach, target date, issued date)`.
_Avoid_: Forecast (the general feature name), estimate, guess

**Lead**:
The number of days between a Prediction's issued date and its target date. Lead 0 means the
Prediction was issued the same day as its target date — the freshest possible Prediction for that
date. Derived from the two stored dates, never stored directly, so it can be recomputed without a
migration.
_Avoid_: Days out, forecast horizon

**Lead Tier**:
The coarse near/mid/far grouping of Lead: near (0-1 days), mid (2-4 days), far (5-6 days) —
provisional boundaries, not an official standard, flagged for retuning once real reconciliation
data exists. Used to bucket confidence calibration by how far out a Prediction was made.
_Avoid_: Distance tier, horizon bucket

**Verdict**:
For a date that has closed out, its own near-tier (Lead 0) Prediction — that Prediction's flag
color plus its own end-of-day confidence — which every older-Lead Prediction issued for the same
date is graded against during Reconciliation. Not to be confused with the frontend's `Verdict`
component, which just renders a Prediction's flag color and confidence, today's or a Verdict's.
_Avoid_: Ground truth, actual result

**Reconciliation**:
The batch step, run first each day before issuing the fresh rolling window, that grades every
closed-out date's older-Lead Predictions against that date's own Verdict, recording a hit or miss
per condition bucket and Lead Tier. Runs even on hours with zero user reports, since mid- and
far-tier Predictions can never receive real reports before their date arrives.
_Avoid_: Grading, verification, backtest
