import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

// RN port of frontend/src/firebase.ts — same firebaseConfig shape/values (see mobile/.env),
// same `firebase` package, just `initializeAuth` + `getReactNativePersistence(AsyncStorage)` in
// place of web's `getAuth` (which defaults to browser localStorage persistence). This is Firebase's
// documented way to get a session that survives app restarts on React Native (see issue #91's
// "Auth" Implementation Decision and #94's persistence acceptance criterion).
const firebaseApp = initializeApp({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
});

export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});
