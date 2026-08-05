# Prediction model architecture: rules + calibrated confidence, no ML/AI training

Type: grilling
Status: resolved

## Question

Should the daily green/yellow/red prognosis be computed by hand-rolled deterministic rules, a trained ML model, or an AI/LLM agent — and by what mechanism does accumulated user feedback adjust future predictions? The app also wants to express a confidence level (e.g. "80% chance of green"), not just a bare color.

## Answer

**Core prediction: deterministic rules, not ML or an LLM.**

Bulgarian flag criteria reduce to thresholds on measurable physical variables (wave height, wind speed/Beaufort, storm warnings). A rule engine over public weather/sea API data computes the flag color directly — correct from day one with no historical data required, fully explainable, and cost-flat: one scheduled batch job per beach per day, bounded by beach count, completely unaffected by viewer traffic or feedback-submission spam.

A trained ML model was rejected: there is no existing digital record of actual historical flag colors (that gap is the reason this app exists), so the only ground truth would be the feedback this app collects itself, starting at zero. With ~10-20 beaches and a small user base, realistic feedback volume per beach is far too sparse to train a reliable supervised model — high overfitting risk to noise (including mistaken or bad-faith reports).

An LLM/AI agent in the core prediction path was rejected on the same cost-scaling concern that motivated this whole ticket: if invoked per prediction, per user view, or per feedback event, cost scales with usage — exactly the "1000 people spam it" scenario the budget can't absorb. (A narrow, bounded-frequency agent use — e.g. parsing free-text storm bulletins once per beach per day — was discussed as a *possible* future enhancement but is explicitly not part of the MVP prediction path.)

**Confidence output: a counting/calibration layer, not a model.**

The "80% chance of green" figure is produced by tracking, per beach and per condition-bucket (e.g. "wind 15-20kt, wave 0.8-1.2m"), how often the rule engine's call has matched what a registered user actually reported — a plain empirical hit-rate. Mechanics:

- Where API data is unambiguous (well clear of all thresholds), state the prediction with full/high certainty regardless of feedback volume.
- Where a day is genuinely borderline and little/no feedback history exists yet, confidence starts from a prior derived from distance-to-threshold (no data required, deterministic).
- As feedback accumulates for a beach/condition-bucket, confidence sharpens from that prior toward the observed hit-rate.
- This is arithmetic/counting end to end — no model gets trained, no LLM gets called — so cost stays flat no matter how much feedback or traffic the app receives.

This decision fixes a standing constraint for the rest of the map (recorded in the map's Notes): the core prediction path stays ML/LLM-free and cost-flat by construction.

## Amendment: hourly buckets within the legal window, not one flag per day

A single once-daily flag value breaks down whenever conditions genuinely change within a day (calm morning, storm rolling in by afternoon): a user reporting the real afternoon flag would look like a miss against a morning-only prediction, dragging down calibration confidence for morning conditions that were never actually wrong.

Fix: the once-daily batch job still runs once per beach per day (no added cost — Open-Meteo returns the full day's hourly forecast in a single response, per [Bulgarian coast weather APIs](03-bulgarian-coast-weather-apis.md)), but instead of collapsing that into one flag, the rule engine evaluates each hour of the legal window (09:00–18:30, per [Feedback collection window and off-season behavior](08-feedback-window-and-off-season.md)) against that hour's forecasted conditions, producing an hourly sequence of predictions rather than a single value. Feedback is then compared, for calibration purposes, against the prediction for its own hour — not a stale morning snapshot. Same batch cadence, same API cost, finer output.
