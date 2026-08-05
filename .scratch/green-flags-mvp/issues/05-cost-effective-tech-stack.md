# Cost-effective tech stack and hosting

Type: grilling
Status: resolved
Blocked by: 03

## Question

Given: a web app, a daily per-beach batch job running the rule engine + calibration layer from [Prediction model architecture](01-prediction-model-architecture.md), a Postgres-or-similar store for beaches/predictions/feedback, registered-user auth, and a ~$10-25/mo ceiling that must hold even if traffic or feedback volume spikes — what hosting/framework/DB combination fits? Needs the weather-API cost/rate-limit facts from [Bulgarian coast weather APIs](03-bulgarian-coast-weather-apis.md) to size correctly (e.g. does the batch job's own API usage risk the budget on its own, independent of user traffic).

## Answer

**Monorepo, separate frontend/backend folders, on managed PaaS free tiers — not a self-managed VPS.**

A single fixed-price VPS would give a *harder* cost-flat guarantee in theory (a contractual flat rate that traffic spikes can't turn into an overage bill), but at this project's real scale (10-20 beaches, a small community user base, one batch run per beach per day) the free tiers below aren't close to being tested, and self-managing OS patching/TLS/deploys/backups is real ops cost a solo MVP build shouldn't take on. The PaaS route's cost-flat guarantee is softer (it holds because free-tier ceilings are generous relative to expected load, not because overage is structurally impossible) but that trade is worth it here.

| Layer | Choice | Cost |
|---|---|---|
| Frontend | React + Vite (static SPA), hosted on Vercel | $0 |
| Backend | Node.js/Express API, hosted on Render (free web service tier) | $0 |
| Batch job trigger | GitHub Actions scheduled workflow, once/day, hits a protected Render endpoint | $0 |
| Database | MongoDB Atlas free tier (M0, 512MB) — user's explicit choice, fits "Postgres-or-similar" | $0 |
| Weather/sea data | Open-Meteo + Meteoalarm (per [Bulgarian coast weather APIs](03-bulgarian-coast-weather-apis.md)) | $0 |
| Domain | Free `.vercel.app` / `.onrender.com` subdomains at launch; custom domain (~$1/mo amortized) deferred as a later DNS-only swap, not a blocking decision | $0 now |

**Total at launch: $0/mo**, against the $10-25 ceiling — headroom reserved for a Render Starter tier upgrade ($7/mo) later if the free tier's spin-down-on-idle cold starts hurt UX, plus a custom domain, while still landing under budget.

**Why the frontend/backend split doesn't need a shared runtime for the cron job:** the batch job is decoupled from both hosts' uptime by triggering it externally via a free GitHub Actions scheduled workflow — the API doesn't need to stay warm for cron correctness, only for serving the mostly-anonymous, bursty read traffic the frontend generates, which free tiers handle fine at this scale.

**Batch job's own API usage does not risk the budget independent of user traffic:** already confirmed by [Bulgarian coast weather APIs](03-bulgarian-coast-weather-apis.md) — ~20-40 Open-Meteo calls/day against its 10,000/day free limit, fixed by beach count, unaffected by viewer or feedback traffic.

**Compatibility note for [Auth implementation approach](07-auth-implementation.md) (still open):** nothing in this stack constrains that decision — email/password, magic link, or OAuth all sit comfortably on a Node/Express + MongoDB backend. Not resolved here.
