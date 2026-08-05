# What public weather/sea-condition APIs cover the Bulgarian Black Sea coast, and at what cost

Type: research
Status: resolved
Research branch: research/bulgarian-coast-weather-apis, commit 7190d81 (findings: .scratch/green-flags-mvp/research/03-bulgarian-coast-weather-apis.md)

## Question

Which public/free (or low-cost) weather and marine-conditions APIs provide data for the Bulgarian Black Sea coast at a resolution useful per-beach — specifically wave height, wind speed/direction, storm/lightning warnings, water temperature, and (if available) rip-current or bathing-water-quality data? For each candidate, note: coverage of the Bulgarian coast specifically, update frequency, free-tier limits and paid pricing, rate limits, and whether it exposes structured fields vs. only free-text bulletins.

This feeds directly into the rule engine from [Prediction model architecture](01-prediction-model-architecture.md) (need the exact fields available to threshold on), the cost-effective tech stack ticket, and the beach-seeding ticket (what per-beach metadata is needed to query these APIs, e.g. lat/long or station id).

## Answer

**Primary: Open-Meteo (Marine Weather API + Weather Forecast API), $0/month.** Live test calls against real Bulgarian coast coordinates (Varna, Burgas/Sunny Beach) confirmed real, non-null wave height, wind-wave height, swell, and sea-surface-temperature data — this needed verification since some global marine models silently mask enclosed seas like the Black Sea. Free tier: 10,000 calls/day (this project needs ~20-40/day), no key, soft overage (warning email, no hard cutoff or billing risk).

**Storm/severe-weather warnings: Meteoalarm's free Bulgaria CAP/Atom feed** — carries NIMH's actual government warnings as structured CAP XML, since Open-Meteo's own thunderstorm weather-codes are explicitly caveated as unreliable outside Central Europe.

**Rejected/deferred:**
- Stormglass.io — free tier is 10 req/day and non-commercial only; cheapest compliant paid plan (~€19/mo) alone would eat 80-100% of the whole project budget.
- Copernicus Marine Service — best regional accuracy (purpose-built Black Sea model, 2.5km grid) and free, but requires a Python/NetCDF pipeline rather than a simple JSON call. Flagged as a phase-2 accuracy upgrade, not MVP.
- NIMH/weather.bg/MASRI (the actual Bulgarian authority data) — numeric access requires a paid contract with unpublished cost. Not usable for MVP budget.
- NOAA rip-current products — confirmed US-only, no Black Sea coverage at all. Rip-current risk must be computed inside Green Flags' own rule engine from wave height/period + onshore wind component; there is no external feed for it anywhere.
- EU Bathing Water Directive / EEA WISE data — exists for Bulgaria but is an annual/seasonal microbiological (E. coli/enterococci) classification, not a daily feed. Usable only as a slow-changing background badge, never as the daily flag trigger.

Estimated monthly cost for the entire weather/marine stack at 10-20 beaches, once/day: **$0** — leaves the full $10-25 budget for hosting/DB/domain (feeds [Cost-effective tech stack](05-cost-effective-tech-stack.md)).

Full findings with inline citations: `.scratch/green-flags-mvp/research/03-bulgarian-coast-weather-apis.md` on branch `research/bulgarian-coast-weather-apis` (commit `7190d81`).
