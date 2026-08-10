# Green Flags Frontend

React + Vite SPA. See [CONVENTIONS.md](./CONVENTIONS.md) for the component-colocation convention.

## Authentication

Signup/login use the Firebase client SDK directly (email/password only), wired up in `src/firebase.ts` and exposed app-wide via `src/auth/AuthContext.tsx`. The `AuthStatus` component in the app header shows a sign-in trigger when signed out and the user's email, a resend-verification action, and logout when signed in. Requires a Firebase project with the Email/Password sign-in provider enabled; set these from the Firebase console (Project settings > General > Your apps > Web app):

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

## Deploying to Render

The checked-in [`../render.yaml`](../render.yaml) defines the frontend as a Render static site.

1. In the Render dashboard, select **New > Blueprint**, connect the `green-flags` repository, and apply `render.yaml`.
2. Add the `VITE_API_BASE_URL` environment variable with the deployed backend URL (for example, `https://green-flags-api.onrender.com`), along with the `VITE_FIREBASE_*` variables.
3. Deploy. The app will be reachable at `https://<service-name>.onrender.com`.

The `/*` to `/index.html` rewrite is required for React Router: it serves the SPA entry point when a visitor directly opens or refreshes a detail URL such as `/beaches/irakli`, while preserving the URL for the client-side router.
