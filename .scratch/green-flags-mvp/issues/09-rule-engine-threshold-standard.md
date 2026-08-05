# Rule-engine data source and threshold standard

Type: grilling
Status: resolved

## Question

Since [Bulgarian flag legal criteria](02-bulgarian-flag-legal-criteria.md) found no Bulgarian statute specifies numeric wave/wind/storm thresholds, what live data source and what reference standard should the rule engine's thresholds actually be anchored to, so they aren't arbitrary?

## Answer

**Data source:** Open-Meteo (Marine + Weather Forecast APIs) stays the sole data source for MVP, as already decided in [Bulgarian coast weather APIs](03-bulgarian-coast-weather-apis.md) — free, verified live against real Bulgarian coast coordinates, ~500x headroom over this project's daily call volume.

**Threshold standard:** anchor to the Beaufort wind-force scale and the WMO/Douglas sea-state scale rather than inventing numbers. These aren't arbitrary picks — Ticket 02's research found the Bulgarian ordinance itself *requires* every rescue station to keep exactly these two reference charts on hand (Приложение № 6), even though it never turns them into a formula. Using them makes Green Flags' thresholds the most locally-legitimate non-invented choice available, and it's honestly explainable in the product ("we use the same reference scales Bulgarian law already requires lifeguards to consult").

Storm/severe-weather signal continues to come from Meteoalarm's Bulgaria CAP feed, already decided in Ticket 03 — no separate NIMH integration needed.

**Deferred/rejected:**
- Copernicus Marine Service (CMEMS) — most authoritative Black Sea-specific model, but requires a Python/NetCDF pipeline rather than a REST call. Stays a phase-2 accuracy upgrade (e.g. if the product ever needs to be defensible for insurance/compliance purposes), not required for MVP.
- Maritime Administration's internal port-closure operational limits — would be the most locally authoritative non-legal source, but the criteria aren't confirmed to be publicly accessible, and the effort to obtain them isn't justified over Beaufort/Douglas + Meteoalarm for MVP.
