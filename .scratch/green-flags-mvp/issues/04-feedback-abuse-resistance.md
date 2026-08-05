# Feedback and abuse-resistance mechanics

Type: grilling
Status: resolved

## Question

Registered users submit corrections to the daily flag prediction (Waze-style). What mechanics keep this trustworthy and cheap under the ~$10-25/mo budget: rate limiting per account, trust/weighting of repeat or verified reporters, handling of conflicting reports for the same beach/day, and defenses against a burst of spam or bad-faith reports (e.g. a coordinated attempt to mark every beach red)? Should reports be capped per account per day/beach?

Also in scope here: large beaches (e.g. Sunny Beach central, Irakli) have many independently-staffed rescue outposts (spacing rules per [Bulgarian flag legal criteria](02-bulgarian-flag-legal-criteria.md)) that may genuinely raise different flags from each other at the same time, even though Green Flags treats the whole named beach as one prediction unit (per-outpost granularity is out of scope for MVP — see the map's Out of scope). At low report volume, a single reporter's outpost-specific divergence can swing confidence hard in the wrong direction; this needs some form of minimum-corroboration requirement or a robust statistic (majority/median rather than a raw running average) so a lone divergent report doesn't get treated as proof the whole-beach prediction was wrong.

## Answer

**Rate limiting:** one feedback submission per registered user per beach per recalculation cycle (i.e. per beach per day, matching the daily batch job cadence from [Prediction model architecture](01-prediction-model-architecture.md)). This bounds any single account's influence to a fixed, low ceiling regardless of platform traffic, and is cheap to enforce (a unique constraint on user/beach/day). It caps *per-account* abuse; it does not stop someone from creating many accounts to get around the cap — that ceiling depends on how cheap an account is to create, which is [Auth implementation approach](07-auth-implementation.md)'s problem, not this ticket's.

**Divergence/corroboration — Bayesian pseudo-count update, not a hard minimum-corroboration gate:**

Treat the historical calibration (the per-condition-bucket "80% green in similar past conditions" baseline from Ticket 01) as worth κ pseudo-observations of evidence. Combine it with today's live reports via a conjugate-style update:

```
posterior_confidence = (prior_confidence × κ + sum_of_today's_reports) / (κ + n_today_reports)
```

This makes the historical baseline (already robust, since it's aggregated across many past days) the anchor, and lets today's live feedback nudge it by an amount that scales with how much same-day evidence exists — one lone divergent report (e.g. from a single outpost's rip current on an otherwise calm beach) barely moves the posterior; several corroborating reports move it meaningfully. This gets the "robust statistic" property the original question asked for without an explicit minimum-report threshold or majority/median rule — it degrades gracefully instead of being all-or-nothing at some arbitrary N.

Critically, κ should **not** be tuned against total platform user count. What matters is reports-per-beach-per-day, not total registered users — a beach can stay thin on same-day data no matter how large the platform's user base gets, since only people actually visiting that specific beach that day report on it. κ is a single global constant (with per-beach variants a possible post-MVP refinement) benchmarked against realistic daily report volume.

**Deferred:** the exact value of κ. Ship with a placeholder (roughly "8-10 corroborating reports needed to swing confidence meaningfully away from baseline for a beach with zero track record") and retune post-launch once real reports-per-beach-per-day data exists. **Flagged for further development down the line** — do not treat the placeholder as final.
