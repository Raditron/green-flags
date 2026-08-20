import { useEffect, useState } from "react";
import { fetchPredictions, PredictionsNotFoundError } from "../data/fetchPredictions";
import type { BeachDailyPredictions } from "../interfaces";

// RN port of frontend/src/components/BeachDetail/hooks/usePredictions.ts's status shape, minus its
// localStorage stale-while-revalidate cache (`refreshing` along with it) — same call BeachList's
// own useBeaches.ts already made for #96: that caching is a frontend-only concern (see #107's
// spec), not part of #97's acceptance criteria, so this keeps the simpler loading/success/error
// shape every other mobile data hook uses. Revisit with an AsyncStorage-backed cache if a future
// mobile ticket asks for it explicitly.
export type PredictionsState =
  | { status: "loading" }
  | { status: "success"; data: BeachDailyPredictions }
  // 404 from the predictions endpoint — no batch run has issued a Prediction for this date yet
  // (e.g. a date that just entered the rolling 7-day window). Distinct from "error" so callers
  // can render "no forecast yet" instead of "couldn't load".
  | { status: "not-found" }
  | { status: "error"; message: string };

// `date` (YYYY-MM-DD) is optional; omitting it fetches today's predictions. Passing a date fetches
// that day's independently — each ForecastStripChip calls this with its own date (see #84).
export function usePredictions(beachId: string, date?: string): PredictionsState {
  const [state, setState] = useState<PredictionsState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchPredictions(beachId, date)
      .then((data) => {
        if (!cancelled) setState({ status: "success", data });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof PredictionsNotFoundError) {
          setState({ status: "not-found" });
          return;
        }
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [beachId, date]);

  return state;
}
