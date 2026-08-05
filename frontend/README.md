# Green Flags Frontend

React + Vite SPA. See [CONVENTIONS.md](./CONVENTIONS.md) for the component-colocation convention.

## Local development

```bash
cp .env.example .env   # point VITE_API_BASE_URL at your local/deployed backend
npm install
npm run dev
```

## Deploying to Vercel

1. In the Vercel dashboard: **Add New > Project**, import the `green-flags` GitHub repo.
2. Set **Root Directory** to `frontend`. Vercel auto-detects the Vite framework preset (build command `npm run build`, output directory `dist`).
3. Add environment variable `VITE_API_BASE_URL` set to the deployed Render backend URL (e.g. `https://green-flags-api.onrender.com`).
4. Deploy. The app will be reachable at `https://<project-name>.vercel.app`; the "System status" card on the homepage confirms the Vercel↔Render↔Atlas path is live.
