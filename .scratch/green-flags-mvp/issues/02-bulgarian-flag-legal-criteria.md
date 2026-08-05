# What Bulgarian regulation defines green/yellow/red beach flags, and what conditions each corresponds to

Type: research
Status: resolved
Research branch: research/bulgarian-flag-legal-criteria, commit ffad6be (findings: .scratch/green-flags-mvp/research/02-bulgarian-flag-legal-criteria.md)

## Question

What Bulgarian law, regulation, or standard governs the green/yellow/red beach-safety flag system (who sets it — national vs. municipal vs. lifeguard service; what body enforces it), and what physical conditions does each color correspond to (wave height, wind speed/Beaufort, rip currents, water quality, lifeguard presence/absence, storm warnings, etc.)? Include any known thresholds or ranges, and note where the rule is a hard numeric threshold vs. left to lifeguard/authority discretion.

This is a hard blocker for building the rule engine decided in [Prediction model architecture](01-prediction-model-architecture.md) — the thresholds it computes must reflect the real legal/regulatory criteria, not guessed ones.

## Answer

**Governing instrument**: Наредба за водноспасителната дейност и обезопасяването на водните площи и басейните за обществено ползване (Council of Ministers Decree № 82/03.04.2024, SG 30/2024, amended SG 47/2024), issued under the Health Act — a national ordinance, not municipal. Flags are legally defined only by Annex 2: green = "bathing permitted," yellow = "bathing permitted with increased caution, no floats/inflatables," red = "bathing forbidden." Day-to-day flag-raising is the beach concessionaire/lessee's duty; Ministry of Tourism approves the annual rescue program and declares "unguarded" beaches each 31 March; Maritime Administration (Varna) signs off on guarded-water maps; Bulgarian Red Cross certifies lifeguards; water quality is a separate ordinance (No 5/2008, transposing EU Directive 2006/7/EC) gating whether a beach can be flagged/guarded at all — a seasonal eligibility check, not a daily trigger.

**The core finding, and it reshapes the rule engine's framing:** there is no codified numeric threshold anywhere in Bulgarian law for wave height, wind speed/Beaufort, storm/lightning, rip currents, or jellyfish. Rescue stations are required to keep a Beaufort wind-force chart and a wave/sea-state chart on hand, but converting that into a flag color is left entirely to the on-duty lifeguard's judgment — logged qualitatively, never as a formula. Jellyfish and visibility aren't mentioned in Bulgarian law at all. The only hard numbers in the ordinance govern staffing ratios, rescue-zone geometry, and the guaranteed duty window (**daily 09:00–18:30, 1 June–30 September**, and only on beaches with "maximum securing" status) — none of which drive flag color.

**Consequence for [Prediction model architecture](01-prediction-model-architecture.md):** its rule engine cannot be "encoding the real legal thresholds" as originally framed, because no such thresholds exist to encode — the decision to use deterministic rules still stands (still the right architecture for the reasons already given), but the specific wave/wind/storm thresholds will have to be *borrowed from elsewhere* (e.g. published lifeguard-industry guidance like RNLI/ILS practice) or *derived from official forecast/marine-warning products* (e.g. NIMH storm bulletins), and should be labeled in the product as Green Flags' own estimate, not a legally mandated figure — this is worth stating plainly in the MVP spec so it isn't misread as an official source.

**New scoping question surfaced, not yet a ticket:** since flags legally only exist during the guaranteed window (09:00–18:30, June 1–Sept 30) on beaches with "maximum securing" status, what should Green Flags show outside that window/season, or for a beach the Ministry of Tourism has declared "unguarded" for the year? Added to the map's fog.

Full findings with inline citations: `.scratch/green-flags-mvp/research/02-bulgarian-flag-legal-criteria.md` on branch `research/bulgarian-flag-legal-criteria` (commit `ffad6be`).
