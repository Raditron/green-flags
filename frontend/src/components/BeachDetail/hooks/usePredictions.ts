import { useEffect, useState } from "react";
import { fetchPredictions, PredictionsNotFoundError } from "../data/fetchPredictions";
import type { BeachDailyPredictions } from "../interfaces";

export type PredictionsState =
  | { status: "loading" }
  | { status: "success"; data: BeachDailyPredictions; updatedAt: string; refreshing: boolean }
  // 404 from the predictions endpoint — no batch run has issued a Prediction for this date yet
  // (e.g. a date that just entered the rolling 7-day window). Distinct from "error" so callers
  // can render "no forecast yet" instead of "couldn't load".
  | { status: "not-found" }
  | { status: "error"; message: string };

interface CachedPredictions {
  data: BeachDailyPredictions;
  updatedAt: string;
}

// Bump whenever BeachDailyPredictions/HourlyPrediction's shape changes, or the cache key itself
// changes shape (e.g. becoming date-aware here), so cached entries written by an older build are
// ignored instead of crashing the reader or being misread under the new key.
const CACHE_VERSION = 4;

function cacheKey(beachId: string, date?: string): string {
  return `green-flags:predictions:${beachId}:${date ?? "today"}`;
}

function readCache(beachId: string, date?: string): CachedPredictions | null {
  try {
    const raw = localStorage.getItem(cacheKey(beachId, date));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version?: number } & CachedPredictions;
    return parsed.version === CACHE_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(beachId: string, date: string | undefined, cached: CachedPredictions): void {
  try {
    localStorage.setItem(cacheKey(beachId, date), JSON.stringify({ version: CACHE_VERSION, ...cached }));
  } catch {
    // Cache is a convenience, not a requirement — ignore storage failures (e.g. quota, private mode).
  }
}

// `date` (YYYY-MM-DD) is optional; omitting it keeps today's behavior exactly as before. Passing a
// date caches independently of both today's entry and every other date for this beach — see #81.
export function usePredictions(beachId: string, date?: string): PredictionsState {
  const [state, setState] = useState<PredictionsState>(() => {
    const cached = readCache(beachId, date);
    return cached
      ? { status: "success", data: cached.data, updatedAt: cached.updatedAt, refreshing: true }
      : { status: "loading" };
  });

  useEffect(() => {
    let cancelled = false;

    fetchPredictions(beachId, date)
      .then((data) => {
        if (cancelled) return;
        const updatedAt = new Date().toISOString();
        writeCache(beachId, date, { data, updatedAt });
        setState({ status: "success", data, updatedAt, refreshing: false });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof PredictionsNotFoundError) {
          setState({ status: "not-found" });
          return;
        }
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
  }, [beachId, date]);

  return state;
}
