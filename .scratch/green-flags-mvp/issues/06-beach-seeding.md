# Beach seeding: which beaches, what data per beach

Type: task
Status: resolved
Blocked by: 03

## Question

Which ~10-20 Bulgarian Black Sea beaches make up the curated MVP launch list, and what data fields must be captured per beach to drive the rule engine and calibration layer (e.g. name, lat/long or nearest weather-station id, any beach-specific quirks worth a manual threshold adjustment)? The exact required fields depend on what [Bulgarian coast weather APIs](03-bulgarian-coast-weather-apis.md) turns up (e.g. lat/long vs. station id).

## Answer

**Per-beach schema:** `name`, `lat`, `long`, `quirk_notes` (optional free text). Open-Meteo (Ticket 03) is queried by coordinates, not station id, so lat/long is the only geo field needed — no station-id lookup, municipality code, or other identifier required anywhere downstream.

**Launch list — 16 beaches**, spread across the full coast (Varna, Burgas, and the south coast) rather than clustered, since even distribution gives every region real user-feedback volume to calibrate against:

| Beach | Region | lat, long | Quirk notes |
|---|---|---|---|
| Varna Central Beach | Varna | 43.1930, 27.9280 | Bay-sheltered, generally calmer than open coast |
| Golden Sands (Zlatni Pyasatsi) | Varna | 43.2939, 28.0345 | — |
| Albena | Varna | 43.3556, 28.0725 | — |
| Kranevo / Sunny Day | Varna | 43.3833, 28.0333 | — |
| Byala | Varna–Burgas transition | 42.8825, 27.8757 | Open coast, more swell-exposed |
| Obzor | Burgas | 42.8214, 27.8814 | — |
| Irakli | Burgas | 42.7300, 27.7500 | Wild/undeveloped, multiple independently-staffed outposts (Ticket 02 spacing rules) — predicted at whole-beach level per map's Out of scope |
| Sveti Vlas | Burgas | 42.6989, 27.7539 | — |
| Sunny Beach (central) | Burgas | 42.6833, 27.7167 | Large multi-outpost beach — same whole-beach caveat as Irakli |
| Nessebar (south beach) | Burgas | 42.6550, 27.7350 | — |
| Pomorie | Burgas | 42.5583, 27.6417 | — |
| Burgas Central Beach | Burgas | 42.4880, 27.4900 | — |
| Sozopol | Burgas | 42.4167, 27.7000 | — |
| Primorsko | Burgas | 42.2611, 27.7583 | — |
| Kiten | Burgas | 42.2167, 27.7667 | — |
| Sinemorets | Burgas (south) | 42.0667, 27.9833 | Furthest south, closest to Strandzha/Turkish border; Open-Meteo is model-based not station-based so coverage is unaffected |

Coordinates are beach-center approximations, adequate for Open-Meteo's model grid resolution — not survey-precision, and not expected to need to be.
