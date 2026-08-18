import { useEffect, useState } from "react";
import { fetchBeaches } from "../data/fetchBeaches";
import type { Beach } from "../../../shared/types/Beach";

export type BeachListState =
  | { status: "loading" }
  | { status: "success"; data: Beach[]; updatedAt: string; refreshing: boolean }
  | { status: "error"; message: string };

interface CachedBeaches {
  data: Beach[];
  updatedAt: string;
}

// Bump whenever Beach's shape changes, or the cache key itself changes shape, so cached entries
// written by an older build are ignored instead of crashing the reader or being misread.
const CACHE_VERSION = 1;

const CACHE_KEY = "green-flags:beaches";

function readCache(): CachedBeaches | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version?: number } & CachedBeaches;
    return parsed.version === CACHE_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(cached: CachedBeaches): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ version: CACHE_VERSION, ...cached }));
  } catch {
    // Cache is a convenience, not a requirement — ignore storage failures (e.g. quota, private mode).
  }
}

export function useBeaches(): BeachListState {
  const [state, setState] = useState<BeachListState>(() => {
    const cached = readCache();
    return cached
      ? { status: "success", data: cached.data, updatedAt: cached.updatedAt, refreshing: true }
      : { status: "loading" };
  });

  useEffect(() => {
    let cancelled = false;

    fetchBeaches()
      .then(({ beaches }) => {
        if (cancelled) return;
        const updatedAt = new Date().toISOString();
        writeCache({ data: beaches, updatedAt });
        setState({ status: "success", data: beaches, updatedAt, refreshing: false });
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
  }, []);

  return state;
}
