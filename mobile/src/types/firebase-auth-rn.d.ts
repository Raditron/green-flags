import type { Persistence, ReactNativeAsyncStorage } from "firebase/auth";

// `firebase/auth`'s package.json exports puts a blanket, unconditional "types" key *before* its
// "react-native" condition in the exports map, so Node/TS exports resolution always matches the
// generic (web) "types" entry first and never reaches the react-native-specific
// `dist/rn/index.rn.d.ts` that actually declares `getReactNativePersistence` — even though Expo's
// base tsconfig sets the "react-native" customCondition correctly, and even though Metro's own
// (non-exports-map) resolver picks the right runtime file at bundle time. This is a known
// firebase-js-sdk packaging gap (the .d.ts split from the runtime resolution), not a mistake in
// our own tsconfig — augment the module locally instead of `as any`-ing every call site. See
// ../firebase.ts, which is the only consumer.
declare module "firebase/auth" {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
