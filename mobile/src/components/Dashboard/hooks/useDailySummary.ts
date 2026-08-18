import { useEffect, useState } from "react";
import { fetchDailySummary } from "../data/fetchDailySummary";
import type { DailySummaryResponse } from "../interfaces";

// RN port of frontend/src/components/Dashboard/hooks/useDailySummary.ts, verbatim.
export type DailySummaryState =
  | { status: "loading" }
  | { status: "success"; data: DailySummaryResponse }
  | { status: "error"; message: string };

// Fetches once on mount, matching the data's actual once-a-day cadence — no interval
// polling, unlike nothing else in this app that would benefit from it either.
export function useDailySummary(): DailySummaryState {
  const [state, setState] = useState<DailySummaryState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetchDailySummary()
      .then((data) => {
        if (!cancelled) setState({ status: "success", data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
