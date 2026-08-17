# Green Flags Mobile

Expo (React Native, TypeScript) client, independent of `../frontend` (see issue #91) but aiming
for full UI/UX parity with it. See [`../frontend/CONVENTIONS.md`](../frontend/CONVENTIONS.md) for
the component-colocation convention this project mirrors.

## Local development

```bash
cp .env.example .env   # point EXPO_PUBLIC_API_BASE_URL at your local/deployed backend, fill in the EXPO_PUBLIC_FIREBASE_* keys
npm install
npx expo start         # then press `w` for a browser preview, or scan the QR code with Expo Go
```

`npx expo start --web` runs the app under `react-native-web` in a browser — the fastest way to
sanity-check a layout change without a device or simulator. `npx expo start` and scanning the QR
code with the [Expo Go](https://expo.dev/go) app on a physical iOS/Android device is closer to the
real target.

## Navigation

`src/navigation/RootNavigator.tsx` composes a bottom tab navigator (Today, Beaches, Saved —
mirroring frontend's `/`, `/beaches`, `/saved` routes) inside a root stack that also holds Beach
Detail (mirroring `/beaches/:beachId`), pushed from the Beaches tab.

## Testing

Jest (`jest-expo` preset) + React Native Testing Library, mirroring `frontend`'s two-seam pattern
(a `data/` test per fetch function, a component-rendering test per component) with colocated
`*.test.ts`/`*.test.tsx` files — no separate `__tests__` directories.

```bash
npm test
```
