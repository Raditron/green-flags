import { useEffect, useState } from "react";
import { fetchHealthcheck } from "../data/fetchHealthcheck";
import type { HealthcheckResponse } from "../interfaces";

export type HealthcheckState =
  | { status: "loading" }
  | { status: "success"; data: HealthcheckResponse }
  | { status: "error"; message: string };

export function useHealthcheck(): HealthcheckState {
  const [state, setState] = useState<HealthcheckState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetchHealthcheck()
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
