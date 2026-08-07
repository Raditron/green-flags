import { useEffect, useState } from "react";
import { fetchBeaches } from "../data/fetchBeaches";
import type { Beach } from "../../../shared/types/Beach";

export type BeachListState =
  | { status: "loading" }
  | { status: "success"; data: Beach[] }
  | { status: "error"; message: string };

export function useBeaches(): BeachListState {
  const [state, setState] = useState<BeachListState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetchBeaches()
      .then(({ beaches }) => {
        if (!cancelled) setState({ status: "success", data: beaches });
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
