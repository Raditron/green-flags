import { useEffect, useState } from "react";
import { fetchPredictions } from "../data/fetchPredictions";
import type { BeachDailyPredictions } from "../interfaces";

export type PredictionsState =
  | { status: "loading" }
  | { status: "success"; data: BeachDailyPredictions; updatedAt: string; refreshing: boolean }
  | { status: "error"; message: string };

interface CachedPredictions {
  data: BeachDailyPredictions;
  updatedAt: string;
}

// Bump whenever BeachDailyPredictions/HourlyPrediction's shape changes, so cached entries written
// by an older build (e.g. missing the confidence field) are ignored instead of crashing the reader.
const CACHE_VERSION = 2;

function cacheKey(beachId: string): string {
  return `green-flags:predictions:${beachId}`;
}

function readCache(beachId: string): CachedPredictions | null {
  try {
    const raw = localStorage.getItem(cacheKey(beachId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version?: number } & CachedPredictions;
    return parsed.version === CACHE_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(beachId: string, cached: CachedPredictions): void {
  try {
    localStorage.setItem(cacheKey(beachId), JSON.stringify({ version: CACHE_VERSION, ...cached }));
  } catch {
    // Cache is a convenience, not a requirement — ignore storage failures (e.g. quota, private mode).
  }
}

export function usePredictions(beachId: string): PredictionsState {
  const [state, setState] = useState<PredictionsState>(() => {
    const cached = readCache(beachId);
    return cached
      ? { status: "success", data: cached.data, updatedAt: cached.updatedAt, refreshing: true }
      : { status: "loading" };
  });

  useEffect(() => {
    let cancelled = false;

    fetchPredictions(beachId)
      .then((data) => {
        if (cancelled) return;
        const updatedAt = new Date().toISOString();
        writeCache(beachId, { data, updatedAt });
        setState({ status: "success", data, updatedAt, refreshing: false });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState((previous) => {
          if (previous.status === "success") {
            return { ...previous, refreshing: false };
          }
          return {
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          };
        });
      });

    return () => {
      cancelled = true;
    };
  }, [beachId]);

  return state;
}
