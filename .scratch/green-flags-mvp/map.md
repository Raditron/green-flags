Label: wayfinder:map

## Destination

A written MVP spec for Green Flags — a web app showing a daily green/yellow/red flag prognosis for a curated set of ~10-20 Bulgarian Black Sea beaches, computed from public weather/sea data and refined by registered-user feedback (Waze-style), covering the prediction approach, data sources, feedback/abuse design, and a tech stack fitting the budget below. Hand this spec to a build session afterward.

## Notes

- Domain: Bulgarian beach flag safety warnings (green/yellow/red per Bulgarian regulation).
- Skills to consult: `/research` for the API/legal research tickets, `/grilling` for architecture decisions, `/prototype` if UI questions arise later.
- Standing preference, locked by Ticket 01: the core prediction path must stay free of ML training and LLM calls, and its cost must stay flat regardless of viewer traffic or feedback volume.
- Constraints locked before charting (destination-grilling, not individual tickets):
  - Platform: web app (not native).
  - Monetization: out of scope for MVP — see Out of scope.
  - Beach scope: curated set of ~10-20 beaches at launch, seeded by the founder — not user-added yet.
  - Feedback: submitting a correction requires a registered account; viewing predictions stays open to anonymous visitors.
  - Update cadence: one batch job/API call per beach per day, but it produces an hourly sequence of predictions across the legal window (09:00-18:30), not a single flat value — see the amendment on [Prediction model architecture](issues/01-prediction-model-architecture.md).
  - Budget ceiling: ~$10-25/mo ongoing infra/API cost.

## Decisions so far

- [Prediction model architecture: rules + calibrated confidence, no ML/AI training](issues/01-prediction-model-architecture.md) — Deterministic rule-based thresholds compute the flag; a simple per-beach statistical hit-rate calibration (counting, not ML/LLM) turns that into a confidence %, sharpening as feedback accumulates. Cost stays flat regardless of traffic or feedback volume.
- [Bulgarian coast weather/sea APIs](issues/03-bulgarian-coast-weather-apis.md) — Open-Meteo (Marine + Weather Forecast APIs) as primary, $0/month, verified live for real Bulgarian coast coordinates; Meteoalarm's free CAP feed for official storm warnings. No rip-current API exists for the Black Sea at any price — computed in-house from wave height/period + wind. Entire weather stack costs $0, leaving the full budget for hosting.
- [Bulgarian flag legal criteria](issues/02-bulgarian-flag-legal-criteria.md) — Flag *meanings* are legally codified (green/yellow/red text in Annex 2 of a 2024 national ordinance), but no numeric wave/wind/storm/jellyfish threshold exists anywhere in Bulgarian law — raising a flag is 100% lifeguard discretion. Flags also only legally apply 09:00–18:30, 1 June–30 Sept, on "maximum secured" beaches.
- [Feedback collection window and off-season behavior](issues/08-feedback-window-and-off-season.md) — No legal liability (Waze-style community tool), but feedback is only collected during the legal flag window (09:00-18:30, June-Sept) since there's no real flag to compare against otherwise. Off-season/off-hours: feedback disabled with a friendly in-app message; the prediction itself can still be shown outside the window.
- [Rule-engine data source and threshold standard](issues/09-rule-engine-threshold-standard.md) — Open-Meteo stays the sole data source (per Ticket 03). Thresholds anchor to the Beaufort wind scale and WMO/Douglas sea-state scale — the same two reference charts Bulgarian law already requires rescue stations to keep on hand, making this the most locally-legitimate non-invented choice. CMEMS and Maritime Administration's internal criteria stay deferred/rejected for MVP.
- [Feedback and abuse-resistance mechanics](issues/04-feedback-abuse-resistance.md) — One feedback submission per user per beach per daily recalculation caps per-account spam (Sybil resistance depends on Ticket 07's account cost, not this ticket). Divergence/corroboration is handled by a Bayesian pseudo-count update — today's reports nudge the historical per-condition baseline by an amount scaled to same-day evidence volume (κ pseudo-observations), rather than a hard minimum-corroboration gate. κ ships as a rough placeholder and is explicitly flagged for retuning post-launch against real reports-per-beach-per-day, not total platform user count.
- [Cost-effective tech stack and hosting](issues/05-cost-effective-tech-stack.md) — Monorepo with separate frontend/backend folders on managed PaaS free tiers: React+Vite on Vercel, Node/Express on Render, MongoDB Atlas (M0) for the DB, GitHub Actions cron triggering the daily batch job. $0/mo at launch against the $10-25 ceiling; free subdomains at launch, custom domain deferred as a non-blocking later swap.
- [Beach seeding: which beaches, what data per beach](issues/06-beach-seeding.md) — Per-beach schema is just `name`, `lat`, `long`, `quirk_notes` (Open-Meteo is coordinate-based, no station id needed). Launch list is 16 named beaches spread across Varna, Burgas, and the south coast, founder-confirmed.
- [Auth implementation approach](issues/07-auth-implementation.md) — Firebase Authentication, email/password, single method for MVP; verified email required before feedback submission (not before signup), supplying the account-cost lever Ticket 04's Sybil resistance depends on. No extra signup throttling for MVP — ships verification-only, retuned post-launch like κ if abuse is observed. Users mirrored into a MongoDB collection keyed by Firebase UID for feedback-cap constraints and future moderation state. $0/month on Firebase's free Spark plan.

## Not yet specified

- Exact value of κ (the pseudo-observation weight of the historical baseline in the live-feedback Bayesian update, per [Ticket 04](issues/04-feedback-abuse-resistance.md)) — ships with a rough placeholder, explicitly deferred for retuning once real reports-per-beach-per-day data exists post-launch.
- How the calibration layer's condition-buckets should be defined (e.g. wind/wave range bins) — now that Ticket 03 has fixed the available fields (wave height, wind-wave height, swell, wind speed/direction, sea surface temp), this is closer to specifiable but the bin boundaries themselves aren't decided yet.
- How rip-current risk gets computed in-house (no external feed exists at all for the Black Sea per Ticket 03) — needs its own formula from wave height/period + onshore wind component.
- Whether the prediction display should carry a different label/tone off-season (e.g. "unofficial, no lifeguard on duty") vs. looking identical to an in-season prediction — folds into the UI/UX fog item below.
- Whether/how a real trained model could ever improve on the rules+calibration baseline once feedback volume is large — explicitly deferred, not an MVP concern.
- Moderation/appeal process for disputed or conflicting feedback reports on the same beach/day.
- UI/UX design of the prediction display (how the flag + confidence % is actually presented).
- Opening beach-adding to all users, once the curated set has validated the model.

## Out of scope

- Monetization (ads, premium features, donations) — ruled out for the MVP during destination-grilling; revisit as a separate future effort if the app gains traction.
- Native mobile app — web app chosen for MVP; a mobile app is future scope built on the same data/API layer, not part of this spec.
- Per-outpost prediction granularity — large beaches (e.g. Sunny Beach central, Irakli) have many independently-staffed rescue outposts (spacing rules per Ticket 02) that may raise different flags from each other at once, but Green Flags predicts at the whole-named-beach level for MVP. Going to per-outpost granularity would fix this more precisely but multiplies scope hugely (a single large beach could have 10+ posts at the legal minimum spacing). Left as a possible future option, not ruled out permanently — revisit only if a specific beach's feedback proves too noisy at whole-beach granularity. Mitigation for MVP (minimum-corroboration/robust-statistic handling of divergent reports) is in scope on [Feedback and abuse-resistance mechanics](issues/04-feedback-abuse-resistance.md).
