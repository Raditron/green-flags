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
