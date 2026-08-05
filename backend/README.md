# Green Flags API

Express backend, organized into four DDD layers:

- `src/presentation` — Express routes/controllers, request/response mapping. No business logic.
- `src/application` — use cases orchestrating a request end to end.
- `src/domain` — framework-free business rules, entities, and ports (interfaces) that infrastructure implements.
- `src/infrastructure` — concrete adapters (MongoDB repositories, the Mongo client, external HTTP clients).

Endpoints:

- `GET /api/health` — writes an incremented ping counter to MongoDB and reads it back, proving the full app-to-database path works.
- `GET /api/beaches` — public, no auth required. Returns the founder-curated launch list of beaches (name, lat/long, optional quirk notes, and a static map pin image as a `data:` URL), read from the `beaches` collection.

## Local development

```bash
cp .env.example .env   # fill in a real MONGODB_URI and GOOGLE_MAPS_API_KEY
npm install
npm run dev             # tsx watch, serves on PORT (default 4000)
```

## Scripts

- `npm run dev` — run the API locally with hot reload
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run the compiled build (`dist/server.js`)
- `npm run typecheck` — `tsc --noEmit`
- `npm test` — run the Vitest suite (spins up an ephemeral in-memory MongoDB via `mongodb-memory-server`, no real database needed)
- `npm run seed` — populate the `beaches` collection against `MONGODB_URI` with the founder-curated launch list, calling the Google Maps Static API exactly once per beach to generate its map pin image (per [ADR 0001](../docs/adr/0001-static-beach-map-generated-at-seed-time.md)). Requires `GOOGLE_MAPS_API_KEY` (a Google Cloud project with the Maps Static API enabled and billing set up — it has a free monthly quota). Safe to re-run: upserts by beach id.

## Deploying to Render (free web service tier)

1. In the Render dashboard: **New > Web Service**, connect the `green-flags` GitHub repo.
2. Set **Root Directory** to `backend`.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables (Render dashboard, not a committed file): `MONGODB_URI`, `MONGODB_DB_NAME`, `FRONTEND_URL` (the deployed Vercel URL). Render sets `PORT` itself.
6. Deploy. The service will be reachable at `https://<service-name>.onrender.com`; confirm with `GET /api/health`.
