import { useCallback, useEffect, useRef, useState } from "react";
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
 *
 * Also returns `refetch`, on top of frontend's version: frontend gets a free refetch every time its
 * router remounts this page, but mobile's Saved tab is a bottom-tab screen that stays mounted once
 * visited (React Navigation doesn't unmount backgrounded tabs), so `user?.uid` never changes again
 * on a return visit and the mount effect below never re-fires. SavedBeaches.tsx calls `refetch` from
 * a navigation-focus listener to make up for that — see its class doc.
 */
export function useSavedBeachesList(user: User | null): SavedBeachesListState & { refetch(): void } {
  const [state, setState] = useState<SavedBeachesListState>({ status: "loading" });

  // Guards against a slower, earlier request (e.g. the mount fetch below) resolving after a later
  // one (a `refetch` call) and clobbering its result — only the response matching the most recently
  // *started* request is allowed to land.
  const latestRequestId = useRef(0);

  const load = useCallback((activeUser: User) => {
    const requestId = ++latestRequestId.current;
    setState({ status: "loading" });
    fetchSavedBeaches(activeUser)
      .then((beaches) => {
        if (latestRequestId.current === requestId) setState({ status: "success", data: beaches });
      })
      .catch((error: unknown) => {
        if (latestRequestId.current === requestId) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });
  }, []);

  // Keyed on uid rather than the User object itself, matching SavedBeachesContext — AuthContext
  // hands out a new User reference on things like its email-verification refresh, which isn't a
  // new session and shouldn't re-fetch the list.
  useEffect(() => {
    if (!user) {
      latestRequestId.current += 1; // invalidates any request still in flight from a prior user
      setState({ status: "loading" });
      return;
    }
    load(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const refetch = useCallback(() => {
    if (user) load(user);
  }, [user, load]);

  return { ...state, refetch };
}
