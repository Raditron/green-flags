// RN port of frontend/src/apiBaseUrl.ts. Expo inlines any EXPO_PUBLIC_-prefixed variable into the
// JS bundle at build time — the RN equivalent of Vite's `import.meta.env.VITE_`-prefixed vars (see
// mobile/.env.example). Same fallback as frontend's for local dev without a `.env` at all.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
