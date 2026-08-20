import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { fetchSavedBeaches } from "../../../saved/data/fetchSavedBeaches";
import type { Beach } from "../../../shared/types/Beach";

export type SavedBeachesListState =
  | { status: "loading" }
  | { status: "success"; data: Beach[] }
  | { status: "error"; message: string };

/**
 * RN port of frontend's SavedBeaches/hooks/useSavedBeachesList.ts: fetches the signed-in visitor's
 * saved Beaches as full records for the Saved tab's grid. Deliberately separate from
 * SavedBeachesContext, which only tracks saved ids (see its class doc) — SavedBeaches reads this
 * hook for the Beach data to render each card, and reads the context live for which of those ids
 * are *currently* saved, so an unsave from this tab's own star drops the card without needing to
 * refetch this list.
 */
export function useSavedBeachesList(user: User | null): SavedBeachesListState {
  const [state, setState] = useState<SavedBeachesListState>({ status: "loading" });

  // Keyed on uid rather than the User object itself, matching SavedBeachesContext — AuthContext
  // hands out a new User reference on things like its email-verification refresh, which isn't a
  // new session and shouldn't re-fetch the list.
  useEffect(() => {
    if (!user) {
      setState({ status: "loading" });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    fetchSavedBeaches(user)
      .then((beaches) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  return state;
}
