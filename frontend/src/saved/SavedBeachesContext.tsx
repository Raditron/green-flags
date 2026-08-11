import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchSavedBeaches } from "./data/fetchSavedBeaches";
import { saveBeach } from "./data/saveBeach";
import { unsaveBeach } from "./data/unsaveBeach";

interface SavedBeachesContextValue {
  isSaved(beachId: string): boolean;
  /** Flips the beach's saved state immediately (optimistic), then fires the corresponding
   * save/unsave request in the background — see the class doc below for the full contract. */
  toggleSave(beachId: string): void;
}

const SavedBeachesContext = createContext<SavedBeachesContextValue | null>(null);

/**
 * Owns the signed-in visitor's set of saved Beach ids as in-memory state, fetched once per
 * sign-in from the backend's saved-beaches endpoint. This is the single seam both the Beach
 * list card and the Beach detail page's star read/toggle through, so the two never disagree
 * about what's saved — see the parent spec (#23) Implementation Decisions.
 *
 * `toggleSave` is optimistic and fire-and-forget: it flips the in-memory state immediately and
 * lets the request resolve in the background, with no in-flight guard blocking a second tap on
 * the same beach right after the first. That relies on save/unsave being idempotent on the
 * backend, so an out-of-order response can never leave the final state permanently wrong — only
 * a *failed* request reverts its own tap's beach id back to its pre-tap state.
 */
export function SavedBeachesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Keyed on uid rather than the User object itself — AuthContext hands out a new User
  // reference on things like its email-verification refresh, which isn't a new session and
  // shouldn't re-fetch the saved set.
  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }

    let cancelled = false;
    fetchSavedBeaches(user)
      .then((beaches) => {
        if (!cancelled) setSavedIds(new Set(beaches.map((beach) => beach.id)));
      })
      .catch(() => {
        // Fail quiet: list/detail stars just show unsaved rather than blocking on or retrying
        // a failed fetch. The next sign-in gets another attempt.
        if (!cancelled) setSavedIds(new Set());
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const isSaved = useCallback((beachId: string) => savedIds.has(beachId), [savedIds]);

  const toggleSave = useCallback(
    (beachId: string) => {
      if (!user) return;
      const activeUser = user;
      const wasSaved = savedIds.has(beachId);

      const optimistic = new Set(savedIds);
      if (wasSaved) {
        optimistic.delete(beachId);
      } else {
        optimistic.add(beachId);
      }
      setSavedIds(optimistic);

      const request = wasSaved ? unsaveBeach(beachId, activeUser) : saveBeach(beachId, activeUser);
      request.catch(() => {
        // Revert only this beach id back to its state from before this tap — computed against
        // whatever the set looks like when the failure lands, so an unrelated toggle that
        // happened in between (a different beach, or a later tap on this same one) isn't
        // clobbered.
        setSavedIds((current) => {
          const reverted = new Set(current);
          if (wasSaved) {
            reverted.add(beachId);
          } else {
            reverted.delete(beachId);
          }
          return reverted;
        });
      });
    },
    [user, savedIds],
  );

  return (
    <SavedBeachesContext.Provider value={{ isSaved, toggleSave }}>
      {children}
    </SavedBeachesContext.Provider>
  );
}

export function useSavedBeaches(): SavedBeachesContextValue {
  const context = useContext(SavedBeachesContext);
  if (!context) {
    throw new Error("useSavedBeaches must be used within a SavedBeachesProvider");
  }
  return context;
}
