# Predictions are reconciled against same-day model output even with zero user reports, but that evidence is tracked separately from, and weighted below, real reports

For any Prediction issued more than a day out, the only way to grade it before real reports exist is
to compare it against that date's own near-tier Prediction — which is itself still a forecast, not
ground truth. Grading a forecast purely against a more recent forecast risks calibration converging
toward "agrees with our own model" rather than "matches reality," since both share whatever bias the
model itself has.

We concluded this comparison is still worth keeping, not discarding: it's the same "forecast
consistency" signal operational meteorology already treats as a real, if bounded, confidence
indicator, and it's the only signal mid/far-lead tiers can ever get — nobody can report on a day
before it happens, so those tiers are self-consistency-only forever, by construction, not just at
launch. We store self-consistency-derived hit/miss tallies separately from report-backed ones per
(bucket, lead tier), and combine them via the same conjugate Bayesian update already used elsewhere
in the confidence formula: self-consistency stats act as a soft, small-κ prior; report-backed stats
(when they exist — only ever for the near tier) update it and are weighted to dominate once
available. This keeps the ceiling honest — self-consistency alone can only ever pull a far-lead
forecast's trust up to "as good as the near-lead model," never further — while still extracting real
signal from the far more abundant free data.
