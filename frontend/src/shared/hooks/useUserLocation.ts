import { useEffect, useState } from "react";
import type { Coordinates } from "../data/utils/geo";

export type UserLocationState =
  | { status: "loading" }
  | { status: "success"; coords: Coordinates }
  // Denied, errored, timed out, or unsupported all collapse into one outcome: callers have no use
  // for *why* the visitor's location isn't known, only that it isn't — see ADR 0005 and CONTEXT.md's
  // "Detected Area" (its fallback, All Areas, doesn't distinguish the reason either).
  | { status: "unavailable" };

// Coarse accuracy is plenty for bucketing into a ~13-municipality coastline, and resolves faster
// / cheaper than GPS-grade precision. A short timeout keeps a stalled permission prompt from
// blocking the beach list indefinitely (see ADR 0005's "brief blocking wait, then settle").
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 0,
};

/** One-shot read of the visitor's browser location. Never persisted, never re-requested after mount. */
export function useUserLocation(): UserLocationState {
  const [state, setState] = useState<UserLocationState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    if (!navigator.geolocation) {
      setState({ status: "unavailable" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        if (cancelled) return;
        setState({
          status: "success",
          coords: { lat: position.coords.latitude, long: position.coords.longitude },
        });
      },
      () => {
        if (!cancelled) setState({ status: "unavailable" });
      },
      GEOLOCATION_OPTIONS
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
