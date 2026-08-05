# Green Flags API

Express backend, organized into four DDD layers:

- `src/presentation` — Express routes/controllers, request/response mapping. No business logic.
- `src/application` — use cases orchestrating a request end to end.
- `src/domain` — framework-free business rules, entities, and ports (interfaces) that infrastructure implements.
- `src/infrastructure` — concrete adapters (MongoDB repositories, the Mongo client, external HTTP clients).

Endpoints:

- `GET /api/health` — writes an incremented ping counter to MongoDB and reads it back, proving the full app-to-database path works.
- `GET /api/beaches` — public, no auth required. Returns the founder-curated launch list of beaches (name, lat/long, optional quirk notes, and — once Google Maps Static API integration is re-enabled — a static map pin image as a `data:` URL), read from the `beaches` collection.
- `POST /api/batch` — triggers the daily prediction batch: fetches a full day's hourly forecast from Open-Meteo (Marine + Weather Forecast APIs) for every seeded beach, checks Meteoalarm's Bulgaria CAP feed for an active coastal storm warning, evaluates each hour of the legal window (09:00-18:30) through the rule engine, and upserts the resulting hourly predictions into the `predictions` collection (one document per beach per date). Not part of the user-facing auth chain — gated by its own shared-secret check instead (`X-Batch-Secret` header must match `BATCH_TRIGGER_SECRET`); meant to be called by a scheduled job, not end users.

## Local development

```bash
cp .env.example .env   # fill in a real MONGODB_URI, GOOGLE_MAPS_API_KEY, and BATCH_TRIGGER_SECRET
npm install
npm run dev             # tsx watch, serves on PORT (default 4000)
```

## Scripts

- `npm run dev` — run the API locally with hot reload
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run the compiled build (`dist/server.js`)
- `npm run typecheck` — `tsc --noEmit`
- `npm test` — run the Vitest suite (spins up an ephemeral in-memory MongoDB via `mongodb-memory-server`, no real database needed)
- `npm run seed` — populate the `beaches` collection against `MONGODB_URI` with the founder-curated launch list. Safe to re-run: upserts by beach id. Google Maps Static API pin generation (per [ADR 0001](../docs/adr/0001-static-beach-map-generated-at-seed-time.md)) is temporarily disabled — seeded beaches have no `mapImage` until it's switched back on.

## Deploying to Render (free web service tier)

1. In the Render dashboard: **New > Web Service**, connect the `green-flags` GitHub repo.
2. Set **Root Directory** to `backend`.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables (Render dashboard, not a committed file): `MONGODB_URI`, `MONGODB_DB_NAME`, `FRONTEND_URL` (the deployed Vercel URL), `BATCH_TRIGGER_SECRET` (a long random string; whoever/whatever schedules the daily batch job needs the same value to call `POST /api/batch`). Render sets `PORT` itself.
6. Deploy. The service will be reachable at `https://<service-name>.onrender.com`; confirm with `GET /api/health`.
