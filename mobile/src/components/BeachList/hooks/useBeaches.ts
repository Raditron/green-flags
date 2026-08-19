import { useEffect, useState } from "react";
import { fetchBeaches } from "../data/fetchBeaches";
import type { Beach } from "../../../shared/types/Beach";

// Fetches on every mount, same as frontend's useBeaches did before #107 layered
// stale-while-revalidate localStorage caching on top — that caching is a frontend-only concern
// (see #107's spec), not part of #96's acceptance criteria, so mobile keeps the simpler
// loading/success/error shape `useDailySummary.ts` also uses. Revisit if a future mobile ticket
// asks for it explicitly (AsyncStorage would replace localStorage as the cache seam).
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
