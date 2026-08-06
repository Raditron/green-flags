# Green Flags Frontend

React + Vite SPA. See [CONVENTIONS.md](./CONVENTIONS.md) for the component-colocation convention.

## Authentication

Signup/login use the Firebase client SDK directly (email/password only), wired up in `src/firebase.ts` and exposed app-wide via `src/auth/AuthContext.tsx`. The `AuthStatus` component (in the app header) shows a "Sign in" trigger when signed out, and when signed in shows the user's email, a "Resend verification email" action if their email isn't verified yet, and "Log out". Requires a Firebase project with the Email/Password sign-in provider enabled; set these from the Firebase console (Project settings > General > Your apps > Web app):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

## Local development

```bash
cp .env.example .env   # point VITE_API_BASE_URL at your local/deployed backend, fill in the VITE_FIREBASE_* keys
npm install
npm run dev
```

## Deploying to Vercel

1. In the Vercel dashboard: **Add New > Project**, import the `green-flags` GitHub repo.
2. Set **Root Directory** to `frontend`. Vercel auto-detects the Vite framework preset (build command `npm run build`, output directory `dist`).
3. Add environment variables: `VITE_API_BASE_URL` set to the deployed Render backend URL (e.g. `https://green-flags-api.onrender.com`), and the `VITE_FIREBASE_*` keys above.
4. Deploy. The app will be reachable at `https://<project-name>.vercel.app`; the "System status" card on the homepage confirms the Vercel↔Render↔Atlas path is live.
