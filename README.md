# Green Flags

Unofficial, community-tuned green/yellow/red swim-safety predictions for Bulgarian Black Sea beaches. See [issue #1](https://github.com/Raditron/green-flags/issues/1) for the full product spec.

## Monorepo layout

- [`backend/`](backend/) — Node.js/Express API, organized into four DDD layers (presentation, application, domain, infrastructure). See [backend/README.md](backend/README.md).
- [`frontend/`](frontend/) — React + Vite SPA, component-colocation convention. See [frontend/README.md](frontend/README.md) and [frontend/CONVENTIONS.md](frontend/CONVENTIONS.md).

Each app has its own `.env` (gitignored) and a committed `.env.example` — copy one to the other and fill in real values for local development.

## Stack

| Layer | Choice | Hosting |
|---|---|---|
| Frontend | React + Vite | Vercel (static SPA, free tier) |
| Backend | Node.js/Express | Render (free web service tier) |
| Database | MongoDB Atlas | M0 free tier |
| Batch trigger | GitHub Actions scheduled workflow | free |

Target: $0/mo at launch. See [.scratch/green-flags-mvp/issues/05-cost-effective-tech-stack.md](.scratch/green-flags-mvp/issues/05-cost-effective-tech-stack.md) for the full rationale.

## Local development

```bash
# backend
cd backend
cp .env.example .env   # fill in MONGODB_URI
npm install
npm run dev             # http://localhost:4000

# frontend (separate terminal)
cd frontend
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:4000
npm install
npm run dev             # http://localhost:5173
```

Visiting the frontend renders a "System status" card that calls the backend's `GET /api/health`, which writes/reads a ping counter in MongoDB — proving the full path is wired end to end.

## Deploying (skeleton for issue #2)

The three managed services below each require their own dashboard/account setup, so this is a manual step (not something an agent can complete without credentials):

1. **MongoDB Atlas** — create a free M0 cluster, add a database user, allow network access from anywhere (0.0.0.0/0, free-tier constraint), and copy the connection string into `MONGODB_URI`.
2. **Render** — deploy `backend/` as a free web service. See [backend/README.md](backend/README.md#deploying-to-render-free-web-service-tier) for exact settings.
3. **Vercel** — deploy `frontend/` as a static SPA. See [frontend/README.md](frontend/README.md#deploying-to-vercel) for exact settings.

Once all three are live, the deployed frontend's "System status" card confirms the full Vercel↔Render↔Atlas path works, satisfying the issue #2 acceptance criteria.

## Daily batch trigger (GitHub Actions)

[`.github/workflows/daily-batch-trigger.yml`](.github/workflows/daily-batch-trigger.yml) calls the deployed backend's `POST /api/batch` once a day (04:00 UTC), so predictions refresh without depending on user traffic to wake a cold-started Render instance. It retries through Render's free-tier cold start (up to ~5 attempts, 15s apart, 120s per attempt) and fails the Actions run on any non-2xx response.

Set these as repository secrets (**Settings > Secrets and variables > Actions**):

- `BATCH_TRIGGER_URL` — the deployed backend's batch endpoint, e.g. `https://<service-name>.onrender.com/api/batch`
- `BATCH_TRIGGER_SECRET` — must match the `BATCH_TRIGGER_SECRET` env var set on Render

Trigger a run manually from the Actions tab (`workflow_dispatch`) to verify the wiring without waiting for the schedule.
