# Green Flags API

Express backend, organized into four DDD layers:

- `src/presentation` — Express routes/controllers, request/response mapping. No business logic.
- `src/application` — use cases orchestrating a request end to end.
- `src/domain` — framework-free business rules, entities, and ports (interfaces) that infrastructure implements.
- `src/infrastructure` — concrete adapters (MongoDB repositories, the Mongo client, external HTTP clients).

Currently the only endpoint is `GET /api/health`, which writes an incremented ping counter to MongoDB and reads it back, proving the full app-to-database path works.

## Local development

```bash
cp .env.example .env   # fill in a real MONGODB_URI
npm install
npm run dev             # tsx watch, serves on PORT (default 4000)
```

## Scripts

- `npm run dev` — run the API locally with hot reload
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run the compiled build (`dist/server.js`)
- `npm run typecheck` — `tsc --noEmit`
- `npm test` — run the Vitest suite (spins up an ephemeral in-memory MongoDB via `mongodb-memory-server`, no real database needed)

## Deploying to Render (free web service tier)

1. In the Render dashboard: **New > Web Service**, connect the `green-flags` GitHub repo.
2. Set **Root Directory** to `backend`.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables (Render dashboard, not a committed file): `MONGODB_URI`, `MONGODB_DB_NAME`, `FRONTEND_URL` (the deployed Vercel URL). Render sets `PORT` itself.
6. Deploy. The service will be reachable at `https://<service-name>.onrender.com`; confirm with `GET /api/health`.
