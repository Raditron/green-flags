# Weather/Marine Data APIs for Bulgarian Black Sea Beaches

## Question and constraints

Green Flags computes a daily green/yellow/red safety flag for ~10-20 named beaches on the Bulgarian Black Sea coast (e.g. Sunny Beach, Golden Sands, Varna, Burgas area beaches). The computation is a deterministic rule engine — no ML/LLM — run **once per day** by a **fixed batch job** that calls each upstream API roughly 10-20 times (one call per beach, or fewer if several beaches share a grid cell), i.e. **~300-600 API calls/month total**. This volume is fixed by the cron schedule, not by user traffic — a malicious user spamming the app's own feedback form cannot cause additional upstream API calls, since the feedback endpoint doesn't touch these APIs at all.

The project is self-funded with a combined infra+API budget ceiling of **~$10-25/month**, and that ceiling must hold even under a traffic spike, because traffic spikes only hit the app's own endpoints, not the batch job. The two things that matter most are therefore:

1. **Coverage** — do these APIs' underlying models actually resolve the Black Sea (a small, enclosed, non-tidal sea), or do they only claim "European" / "global" coverage while silently masking out enclosed seas, the way many ocean models do?
2. **Overage economics** — if the free tier is undersized, does exceeding it *hard-fail* (safe: batch job logs an error, no charge) or *auto-bill* (dangerous only if the batch job itself is buggy and loops/retries; irrelevant to feedback-form spam either way, since spam never reaches these APIs).

Below, each candidate is evaluated against: coverage/resolution, update frequency/horizon, free tier, paid tiers, rate-limit/overage behavior, and output format. Live API test calls (made 2026-08-05) are cited as `[Live API test]` where used to verify claims documentation pages left ambiguous.

---

## 1. Open-Meteo — Marine Weather API + Weather Forecast API

**Coverage.** Open-Meteo's marine product blends several underlying wave models and auto-selects the best one per point ("best match"): DWD ICON GWAM (global, 0.25°), DWD ICON EWAM ("Europe" domain, 0.05°/~5 km — but this European high-resolution domain is documented as covering "the United Kingdom, southern coasts of Norway, the Mediterranean sea, France and Western Africa until Mauritania," with **no explicit mention of the Black Sea** [Open-Meteo Marine Weather API docs](https://open-meteo.com/en/docs/marine-weather-api)), MeteoFrance MFWAM (global, 0.08°), ECMWF WAM (global, 0.25°/9 km), NCEP GFS Wave (global 0.25°, and a nested 0.16° domain spanning 52.5°N-15°S), and ERA5-Ocean (global, 0.5°) — full list and resolutions per [Open-Meteo Marine Weather API docs](https://open-meteo.com/en/docs/marine-weather-api). Because the EWAM high-res European domain's stated coverage does not include the Black Sea, Bulgarian coordinates would fall back to one of the coarser *global* wave models (28 km DWD GWAM class, or similar) for wave-specific fields.

Rather than rely on this ambiguity, I ran a **live query** against the production endpoint for Sunny Beach, Bulgaria (42.65°N, 27.73°E) requesting `wave_height, wind_wave_height, swell_wave_height, sea_surface_temperature`: all four fields returned real, non-null numeric values for the full 72-hour window (e.g. wave_height 0.16-0.22 m, sea_surface_temperature ~25.3-25.5°C) [Live API test, `https://marine-api.open-meteo.com/v1/marine?latitude=42.65&longitude=27.73&...`, 2026-08-05]. This is strong direct evidence the Black Sea **is** populated (not masked/null) in whichever global model Open-Meteo falls back to there, even though no single piece of Open-Meteo documentation explicitly says "we cover the Black Sea."

The companion regular Weather Forecast API (needed for wind speed/direction/gusts and storm signal) uses "best match" across DWD ICON (2-11 km, described as covering Europe more broadly), NOAA GFS (3-25 km, global), and others [Open-Meteo docs](https://open-meteo.com/en/docs). A live query for the same coordinate requesting `wind_speed_10m, wind_direction_10m, wind_gusts_10m, weather_code, cape, precipitation` returned fully populated numeric data for all fields (e.g. wind 3.6-10 km/h range, weather_code 0/1, cape 0-30 J/kg) [Live API test, `https://api.open-meteo.com/v1/forecast?...`, 2026-08-05]. Note: Open-Meteo documents that the fine-grained thunderstorm weather codes 95-99 are "available in Central Europe only" [Open-Meteo docs](https://open-meteo.com/en/docs) — a domain that likely does **not** extend to Bulgaria, so storm/thunderstorm detection there would rely on the coarser global WMO weather-code classification (still usable, just less precise on convective timing) rather than the highest-fidelity storm codes.

**Update frequency / horizon.** Marine models update "every 6 hours" (ECMWF/GFS) to "every 24 hours" (MeteoFrance), with a default 7-day forecast (up to 15-16 days for ECMWF/GFS-derived data) [Open-Meteo Marine Weather API docs](https://open-meteo.com/en/docs/marine-weather-api). The weather API updates hourly to every 6 hours depending on model, with 7-day default / 16-day max horizon [Open-Meteo docs](https://open-meteo.com/en/docs). Either is far more than adequate for a once-daily batch refresh.

**Free tier.** 600 calls/minute, 5,000/hour, 10,000/day, 300,000/month — but **restricted to non-commercial use** [Open-Meteo Pricing](https://open-meteo.com/en/pricing). At ~300-600 calls/month total (across both APIs, well under 1% of the free monthly cap), Green Flags fits trivially inside the free tier on volume — the only open question is whether the project counts as "non-commercial" under Open-Meteo's terms (a free, self-funded, non-ad-supported safety tool plausibly qualifies, but this should be confirmed against Open-Meteo's actual terms of use before launch).

**Paid tiers.** If commercial licensing is ever required: Standard (1M calls/month), Professional (5M/month), Enterprise (50M+/month), each adding dedicated infrastructure and 99.9% uptime SLA — the pricing page describes tier *limits* but does not list dollar prices on the page itself [Open-Meteo Pricing](https://open-meteo.com/en/pricing); actual current per-tier USD/EUR pricing would need to be confirmed at checkout/contact, as the publicly fetched page did not render numeric prices.

**Rate limits / overage behavior.** Exceeding the free tier does **not** currently hard-block or auto-bill: Open-Meteo sends "email alerts at 80%, 90%, and 100% of your monthly budget," and states a usage dashboard/enforcement mechanism is still "under development" [Open-Meteo Pricing](https://open-meteo.com/en/pricing). This is effectively the safest possible overage model for this project: at the stated volumes there is no realistic path to being throttled, billed, or blocked, and there is no mechanism by which user-facing traffic (which never touches this API) could cause a charge.

**Output format.** Clean structured JSON, one numeric value per requested variable per hourly timestep — directly consumable by a rule engine with no parsing step [Open-Meteo Marine Weather API docs](https://open-meteo.com/en/docs/marine-weather-api); confirmed via live test.

---

## 2. Stormglass.io

**Coverage.** Stormglass aggregates "Wave, Current, Swell, Secondary Swell, Wind Wave, Water Temperature, Ice, Sea Depth, Chlorophyll, Salinity, PH, Oxygen, Phytoplankton" plus standard weather variables, sourced from NOAA, Météo France, Met Office, ECMWF, and DWD [Stormglass.io](https://stormglass.io/). The marketing site does not explicitly confirm or deny Black Sea/enclosed-sea coverage, and the interactive API documentation site (docs.stormglass.io) is a client-side-rendered single-page app that did not yield readable content via automated fetch in this research pass — its rate-limit/overage and per-region coverage details could not be directly confirmed from primary source text and should be verified manually (e.g., via a live trial API call to a Bulgarian coordinate) before committing to this provider.

**Free tier.** 10 requests/day, non-commercial use only [Stormglass.io Pricing](https://stormglass.io/pricing). At 10-20 beaches/day this free tier is **undersized** on its own (one request per beach per day would consume the entire daily quota with zero headroom, and would not cover both a morning wave-check and any retry).

**Paid tiers.** Small: €19/month, 500 requests/day, still non-commercial. Medium: €49/month, 5,000 requests/day, **first tier with commercial-use rights**. Large: €129/month, 25,000 requests/day, commercial [Stormglass.io Pricing](https://stormglass.io/pricing). All paid tiers get a 10% discount if billed annually [Stormglass.io Pricing](https://stormglass.io/pricing). All tiers include "All weather parameters" — no field-level gating [Stormglass.io Pricing](https://stormglass.io/pricing). For a public-facing product that plausibly needs commercial-use rights, the realistic entry price is the **Medium tier at €49/month (~$53-55)**, which alone exceeds the top of the stated $10-25 budget ceiling if it's the only API in use — though the Small tier at €19/month would fit budget and volume (500/day ≫ 20/day) if the "non-commercial" restriction is acceptable for this project.

**Rate limits / overage behavior.** Could not be confirmed from primary documentation in this pass — the public pricing page states request-per-day caps per tier but does not describe on-page what HTTP status is returned or whether overage is blocked vs. metered-billed beyond the plan [Stormglass.io Pricing](https://stormglass.io/pricing); the dedicated API docs subdomain did not return parseable content to automated fetch. This is a meaningful open question before adopting Stormglass, and should be resolved with a manual trial-account test rather than assumed.

**Output format.** JSON, structured per-parameter numeric fields [Stormglass.io](https://stormglass.io/).

**Verdict for this project:** more expensive than Open-Meteo for equivalent or better field coverage, with an undersized free tier for 10-20 beaches/day and an unconfirmed overage policy. Only worth adopting as a *secondary* source for fields Open-Meteo lacks (e.g., ocean chemistry variables), not as the primary wave/wind source.

---

## 3. Copernicus Marine Service — Black Sea regional products

**Coverage.** Copernicus Marine Service runs **dedicated, purpose-built Black Sea regional models** — this is the strongest possible confirmation of enclosed-sea coverage of any candidate:
- **BLKSEA_ANALYSISFORECAST_WAV_007_003** (waves): spatial resolution 0.025° × 0.025° (~2.5 km), updates twice daily (00:00 and 12:00 UTC), 10-day forecast horizon, produced by the WAM Cycle 6 spectral wave model, geographic coverage spans 40.5°-47.33°N and 27.25°-42°E — "encompasses the entire Black Sea basin including Bulgarian coastal areas" [Copernicus Marine Service, BLKSEA_ANALYSISFORECAST_WAV_007_003](https://data.marine.copernicus.eu/product/BLKSEA_ANALYSISFORECAST_WAV_007_003/description). Variables include significant wave height, wave direction, mean/max period, wind-wave and swell-wave components, Stokes drift.
- **BLKSEA_ANALYSISFORECAST_PHY_007_001** (physics/temperature/currents): same 0.025° × 0.025° resolution, coverage 39.5°-47.33°N and 25°-42°E (also includes Bulgarian coast), daily updates, 3D fields for water temperature, salinity, currents, plus 2D sea-surface-height/mixed-layer fields [Copernicus Marine Service, BLKSEA_ANALYSISFORECAST_PHY_007_001](https://data.marine.copernicus.eu/product/BLKSEA_ANALYSISFORECAST_PHY_007_001/description).

This confirms Copernicus is the only candidate with a purpose-built regional Black Sea grid at ~2.5 km resolution — an order of magnitude finer than any global model discussed here.

**Update frequency / horizon.** Waves: twice daily, 10-day forecast [Copernicus Marine Service](https://data.marine.copernicus.eu/product/BLKSEA_ANALYSISFORECAST_WAV_007_003/description). Physics: daily [Copernicus Marine Service](https://data.marine.copernicus.eu/product/BLKSEA_ANALYSISFORECAST_PHY_007_001/description). Comfortably exceeds what a once-daily batch job needs.

**Free tier / cost.** Fully free — "Provides free, open, regular and systematic reference information" [Copernicus Marine Service](https://data.marine.copernicus.eu/product/BLKSEA_ANALYSISFORECAST_WAV_007_003/description) — no subscription fee for any product. Access requires a free Copernicus Marine account (registration) [marine.copernicus.eu Access Data](https://marine.copernicus.eu/access-data). The official `copernicusmarine` Python toolbox is documented as having **no quota on data volume or bandwidth** for subset/download operations, with a configurable (default 15) concurrent-request limit purely for client-side parallelism management, not a server-imposed cap [search of Copernicus Marine Toolbox documentation — see `https://help.marine.copernicus.eu/en/articles/8283072-copernicus-marine-toolbox-api-subset` and `https://toolbox-docs.marine.copernicus.eu/en/pre-releases-2.0.0a4/python-interface.html`].

**Rate limits / overage behavior.** No metered billing exists at all — there is no paid tier to overage into. Worst case is a failed/slow subset request, never a charge. This makes Copernicus Marine the **only candidate with zero cost risk under any traffic condition**, including malicious spam (which can't reach it anyway) or a miscoded batch job (which could at most retry/fail, never rack up a bill).

**Output format — the real cost of Copernicus.** Data is delivered as **NetCDF-4** gridded files, not a simple per-point JSON REST response [Copernicus Marine Service, BLKSEA_ANALYSISFORECAST_WAV_007_003](https://data.marine.copernicus.eu/product/BLKSEA_ANALYSISFORECAST_WAV_007_003/description). Consuming it means either (a) running the `copernicusmarine` Python toolbox's `subset` command to pull a small NetCDF slice per beach coordinate and then parsing NetCDF with a library like `xarray`/`netCDF4`, or (b) standing up a small Python microservice the Node/whatever-stack batch job shells out to. This is **materially more engineering effort** than a REST/JSON API — no dollar cost, but real integration complexity and an extra runtime dependency (Python + netCDF stack) in the batch job.

**Verdict for this project:** best raw coverage and resolution of any candidate, and literally free with no overage risk — but the ops/engineering cost (NetCDF parsing, Python toolbox, registration/token refresh) is the highest of any candidate here. Worth using specifically for wave height/period/direction and sea temperature if the team is willing to absorb that one-time integration cost, since it is the only source purpose-built for the Black Sea.

---

## 4. ECMWF Open Data

**Coverage.** Free subset of ECMWF's real-time IFS and AIFS model output, 0.25° resolution GRIB2 (~28 km) globally unless otherwise stated [ECMWF Open Data](https://www.ecmwf.int/en/forecasts/datasets/open-data). Includes wave parameters (significant wave height, mean/peak wave period, wave direction, and period-banded wave heights) and ocean fields (SST, sea ice, current velocity) [ECMWF Open Data](https://www.ecmwf.int/en/forecasts/datasets/open-data). The documentation makes **no specific mention of Black Sea coverage or exclusion** [ECMWF Open Data](https://www.ecmwf.int/en/forecasts/datasets/open-data) — unlike Copernicus's dedicated regional product, this is a global grid at coarse (~28 km) resolution, which for the whole Black Sea (roughly 1,000 km × 600 km) gives only a handful of grid points near the Bulgarian coast; usable as a wind/pressure cross-check but not a fine-grained per-beach wave source.

**Update frequency / horizon.** Four daily cycles (00/06/12/18 UTC); IFS high-res forecasts to 360 hours (15 days) at 6-hourly steps beyond 144h; AIFS to 360 hours [ECMWF Open Data](https://www.ecmwf.int/en/forecasts/datasets/open-data).

**Free tier / licensing.** Entirely free, CC-BY-4.0 licensed (commercial redistribution allowed with attribution) [ECMWF Open Data](https://www.ecmwf.int/en/forecasts/datasets/open-data). The only documented "limit" is a system-protection cap of 500 simultaneous connections [ECMWF Open Data](https://www.ecmwf.int/en/forecasts/datasets/open-data) — irrelevant at 10-20 sequential daily calls.

**Rate limits / overage behavior.** No billing model exists — it's a free open-data drop, only a rolling 2-3 day retention archive [ECMWF Open Data](https://www.ecmwf.int/en/forecasts/datasets/open-data), so the batch job must fetch promptly after each run. Zero overage/cost risk, same category as Copernicus.

**Output format.** Raw GRIB2 files, not JSON — requires a GRIB decoding library (e.g. `eccodes`/`cfgrib`) and manual nearest-grid-point extraction per beach coordinate. Similar integration burden to Copernicus, for coarser Black Sea resolution. **Verdict:** not worth the integration cost here given Open-Meteo already re-packages comparable global-model data as free JSON.

---

## 5. NOAA WaveWatch III / GFS-Wave

**Coverage.** WaveWatch III is described as "a global-scale wave model with approximately 50-km or 0.5-degree resolution," driven by GFS winds at 0.5°/3-hour resolution, with a 9-grid nested multigrid system where higher-resolution regional grids exist mainly for near-shore US waters [search summary of NOAA WW3 documentation, `https://polar.ncep.noaa.gov/waves/implementations.shtml` and `https://polar.ncep.noaa.gov/waves/wavewatch/manual.v4.18.pdf`]. No Black Sea-specific nested grid was found in the documentation reviewed. At ~50 km global resolution, the entire Bulgarian coastline would be represented by only 1-2 grid points, with no confirmation those points aren't masked out as an enclosed/marginal sea (a common practice in global wave models). Given Open-Meteo already re-serves comparable-or-better global GFS-Wave data (0.25°/~28 km, confirmed live to return real Black Sea data) as clean JSON, there is no reason to integrate NOAA's raw GRIB feeds directly for this project.

**Verdict:** not recommended — coarser than Open-Meteo's own repackaging of similar global models, no confirmed Black Sea nesting, and GRIB-only output. Skip.

---

## 6. Bulgarian National Institute of Meteorology and Hydrology (NIMH / meteo.bg)

**Coverage / content.** NIMH runs its own operational marine forecast: the "Sea State Forecast" page describes forecasts of "significant wave height, mean direction of wave propagation and wave period," plus wind (from ARPEGE and ALADIN atmospheric models) and storm-surge/coastal-flood warnings, on "a numerical grid of 41.5°N to 46.5°N and 28.0°E to 41.5°E" for the Black Sea, with a higher-resolution (~400 m) nest specifically for the Bay of Burgas [meteo.bg Sea State Forecast](http://meteo.bg/meteo7/en/morskiPrognozien). This is in principle the single most locally-relevant, highest-resolution (400 m at Burgas) source in this whole survey.

**Access model.** However, this is presented as an **informational/institutional bulletin page, not a public API** — detailed forecast delivery "via Internet" is described as available only "upon contract signing" [meteo.bg Sea State Forecast](http://meteo.bg/meteo7/en/morskiPrognozien), i.e., a paid/negotiated B2B data feed with no self-serve pricing, documentation, or JSON endpoint published. NIMH's main site (meteo.bg) is primarily Bulgarian-language, offers PNG/image bulletins and links to related portals (hydro.bg, agro.meteo.bg, sea.meteo-varna.net, airquality.meteo.bg), references an "experimental open data portal" at `/bg/node/1345`, but that specific page returned HTTP 404 on both the Bulgarian and root paths tried in this research pass, and no public API documentation was found on the main site [meteo.bg homepage](https://www.meteo.bg).

**Verdict:** best potential local resolution, but not usable as a self-serve, budget-fitting API today — would require direct outreach/negotiation with NIMH for commercial access terms, which is out of scope for a $10-25/month self-funded project unless NIMH's contract pricing turns out to be trivial (unconfirmed; would need direct contact, not a documented price list).

---

## 7. Bathing water quality (EU Bathing Water Directive / EEA)

**Coverage.** The EEA publishes an annual "European bathing water quality" report and interactive map covering ~22,000 designated coastal and freshwater bathing sites across the EU, based on country-reported monitoring data for the 2022-2025 seasons; Bulgaria is included, with **95%+ of Bulgarian bathing waters classified "excellent" and all classified at least "sufficient"** for the 2025 season [EEA, European bathing water quality in 2025](https://www.eea.europa.eu/en/analysis/publications/european-bathing-water-quality-in-2025), and a dedicated Bulgaria country factsheet PDF is published [EEA Bulgaria bathing water country factsheet 2025](https://www.eea.europa.eu/en/topics/in-depth/bathing-water/state-of-bathing-water/bathing-water-country-factsheets-2025/bg-bathing-water-country-factsheet-2025.pdf).

**Update frequency — critical caveat.** This is an **annual, retrospective classification**, not a daily or even seasonal live feed: the EEA state-of-bathing-water page is only refreshed once per year after each bathing season closes, and its classification reflects the prior four seasons' aggregated samples, not "today's water quality" [EEA, State of bathing water](https://www.eea.europa.eu/en/topics/in-depth/bathing-water/state-of-bathing-water). This makes it structurally unsuitable as an input to a *daily* rule engine — at best it's a static, once-a-year-refreshed "historical safety reputation" tag per beach, not a live signal.

**Machine-readable access.** The EEA does provide underlying data through its "Waterbase" database and general Datahub (`https://www.eea.europa.eu/en/datahub`), which covers water quality data across 38 European countries in downloadable/queryable form (including a "Discodata" API/query interface for Waterbase) [EEA Datahub](https://www.eea.europa.eu/en/datahub); however, this research pass could not locate a specific per-beach-site, machine-readable bathing-water-classification dataset/API entry (distinct from the annual PDF factsheets and the human-facing interactive map) — the closest confirmed items were general Water Framework Directive spatial datasets (shapefiles/WFS) covering "protected areas" broadly, not a bathing-water-specific feed [EEA WISE WFD Protected Areas download](https://www.eea.europa.eu/data-and-maps/data/wise-wfd-protected-areas-2/data-download). A team wanting this data machine-readable would need direct follow-up with EEA/Discodata or with Bulgaria's own Black Sea Basin Directorate publications, which were not found to expose any API either (only public bulletins/reports typical of an environmental regulator).

**Verdict:** usable at most as a **static, once-a-year "historical quality" badge per beach** (e.g., "this beach was rated excellent in the 2025 EEA report"), manually updated once a year from the PDF factsheet — not as a live daily rule-engine input, and not as a rip-current signal (bathing water quality measures fecal/microbiological contamination, not physical hazard).

---

## 8. Rip-current risk — no dedicated source found

No API or dataset specific to rip-current risk for the Black Sea/Bulgarian coast was found in this research pass. This is unsurprising: rip currents are typically forecast (where they're forecast at all, e.g. NOAA's US-only rip current model) from a combination of nearshore bathymetry, wave height/period/direction, and wind — not published as a standalone Black Sea product by any candidate above. **The practical path is to derive a rip-current risk proxy inside Green Flags' own rule engine** from Open-Meteo/Copernicus wave-height, wave-period, and onshore-wind-component fields (a well-documented heuristic approach used by several coastal-hazard rule-of-thumb systems), rather than looking for a third-party rip-current API — none exists for this region.

---

## 9. Lightning — likely unnecessary as a separate source

Blitzortung.org's public data-service page could not be fetched directly in this pass (404 on the URL attempted; a corrected URL was not re-attempted due to time), so its terms/coverage for Bulgaria are **unconfirmed** and should be verified directly (`https://www.blitzortung.org/`) before relying on it. However, a dedicated lightning network is likely unnecessary here: both Open-Meteo's weather-code field (WMO standard codes including 95-99 for thunderstorms) and ECMWF's CAPE field (confirmed live-populated for the Sunny Beach coordinate, e.g. non-zero CAPE values appearing in the forecast window [Live API test, `https://api.open-meteo.com/v1/forecast`, 2026-08-05]) already give a storm/thunderstorm signal usable by the rule engine at zero extra integration cost. A dedicated lightning feed would only be worth adding later if false-negative storm misses become a demonstrated problem in practice.

---

## Recommendation

**Primary: Open-Meteo (Marine Weather API + Weather Forecast API), free tier.**

- **Wave height/period/direction and sea temperature:** Open-Meteo Marine API. Live-tested and confirmed to return real, non-null values for a Sunny Beach, Bulgaria coordinate [Live API test, 2026-08-05] — this is the strongest available evidence given that Open-Meteo's own docs never explicitly claim Black Sea coverage.
- **Wind speed/direction/gusts and storm signal (CAPE, WMO weather code):** Open-Meteo Weather Forecast API, same live-test confirmation.
- **Cost at 300-600 calls/month:** **$0.** This is roughly 0.1-0.2% of the 300,000-calls/month free-tier ceiling [Open-Meteo Pricing](https://open-meteo.com/en/pricing), and Open-Meteo's stated overage behavior for exceeding any tier is presently just an email alert, not a block or a bill [Open-Meteo Pricing](https://open-meteo.com/en/pricing) — i.e., there is no metered-billing path that a bug (or, irrelevantly, feedback-form spam that never reaches this API) could trigger. The one item to close out before launch: confirm Green Flags qualifies as "non-commercial" under Open-Meteo's terms, since the free tier is restricted to that use case [Open-Meteo Pricing](https://open-meteo.com/en/pricing).

**Upgrade path if higher fidelity is wanted later: add Copernicus Marine Service's BLKSEA_ANALYSISFORECAST_WAV_007_003 and BLKSEA_ANALYSISFORECAST_PHY_007_001** as a second, purpose-built-for-the-Black-Sea source (2.5 km resolution vs. Open-Meteo's ~28 km global fallback) [Copernicus Marine Service](https://data.marine.copernicus.eu/product/BLKSEA_ANALYSISFORECAST_WAV_007_003/description). It is also **$0** and has no overage/billing mechanism at all [Copernicus Marine Service Toolbox docs]. The only cost is engineering time to consume NetCDF via the `copernicusmarine` Python toolbox rather than a REST JSON call — worth doing once traction justifies the higher-fidelity wave/temperature data, but not required to launch, since Open-Meteo already clears the bar for volume, cost, and (per live test) actual data availability at Bulgarian coordinates.

**Storm/lightning:** covered adequately by Open-Meteo's weather codes + CAPE at $0 extra cost; no dedicated lightning API needed at launch.

**Rip-current risk:** no third-party source exists for this region — compute an in-house heuristic proxy from wave height/period + onshore wind component inside the rule engine. Document this as a known modeling simplification, not a data-sourcing gap to keep chasing.

**Bathing water quality:** EEA publishes Bulgaria-level and (via country factsheets) more granular annual data, but it refreshes once a year and reflects the *prior* four seasons, not "today" [EEA European bathing water quality in 2025](https://www.eea.europa.eu/en/analysis/publications/european-bathing-water-quality-in-2025). Recommendation: pull this once a year (manually, from the PDF factsheet) as a static "historical water-quality reputation" badge per beach, not as a daily-refreshed input — and be explicit in the product UI that this is an annual EU classification, not today's reading, since no better machine-readable, current source was found for this region.

**Rough monthly cost estimate for the recommended combination (Open-Meteo only, at launch):**

| Item | Volume | Cost |
|---|---|---|
| Open-Meteo Marine API | ~10-20 calls/day × 30 days ≈ 300-600/month | $0 (free tier, non-commercial) |
| Open-Meteo Weather Forecast API | ~10-20 calls/day × 30 days ≈ 300-600/month | $0 (free tier, non-commercial) |
| EEA bathing-water badge | 1 manual pull/year | $0 |
| **Total API cost** | | **$0/month** |

This leaves the entire $10-25/month ceiling available for hosting/infra, with zero risk of API overage charges regardless of user-facing traffic, since the batch job's call volume is fixed and Open-Meteo's current overage policy doesn't bill or block at this scale in the first place.
