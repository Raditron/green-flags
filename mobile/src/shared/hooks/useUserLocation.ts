import { useEffect, useState } from "react";
import * as Location from "expo-location";
import type { Coordinates } from "../data/utils/geo";

export type UserLocationState =
  | { status: "loading" }
  | { status: "success"; coords: Coordinates }
  // Denied, errored, timed out, or unsupported all collapse into one outcome: callers have no use
  // for *why* the visitor's location isn't known, only that it isn't — see ADR 0005 and CONTEXT.md's
  // "Detected Area" (its fallback, All Areas, doesn't distinguish the reason either). Mirrors
  // frontend's useUserLocation one-for-one, aside from the expo-location API underneath.
  | { status: "unavailable" };

// Balanced accuracy is plenty for bucketing into a ~13-municipality coastline, and resolves faster
// than GPS-grade precision. A short timeout keeps a stalled permission prompt or a cold GPS fix
// from blocking the beach list indefinitely — see ADR 0005's "brief blocking wait, then settle".
const LOCATION_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Location request timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * One-shot read of the visitor's device location via `expo-location`. Never persisted, never
 * re-requested after mount. `requestForegroundPermissionsAsync` is itself what fires the OS
 * permission prompt automatically when permission hasn't been decided yet (and resolves
 * immediately, with no prompt, once it has) — satisfying #96's "permission prompt fires
 * automatically on this screen mounting" without a separate "ask" step.
 */
export function useUserLocation(): UserLocationState {
  const [state, setState] = useState<UserLocationState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function resolveLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (!cancelled) setState({ status: "unavailable" });
          return;
        }

        const position = await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          LOCATION_TIMEOUT_MS,
        );

        if (cancelled) return;
        setState({
          status: "success",
          coords: { lat: position.coords.latitude, long: position.coords.longitude },
        });
      } catch {
        if (!cancelled) setState({ status: "unavailable" });
      }
    }

    resolveLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
