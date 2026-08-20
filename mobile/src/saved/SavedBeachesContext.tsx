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
  /** True once this provider's own fetch of the signed-in visitor's saved ids has settled
   * (success or failure) for the current sign-in. The Saved tab fetches the same beaches a second
   * time (for the full Beach records `isSaved` doesn't carry) and needs this to tell "not saved"
   * apart from "haven't heard back yet" — see SavedBeaches's class doc. */
  isReady: boolean;
}

const SavedBeachesContext = createContext<SavedBeachesContextValue | null>(null);

/**
 * RN port of frontend's saved/SavedBeachesContext.tsx — same in-memory set of saved Beach ids,
 * same fetch-once-per-sign-in/optimistic-toggle/revert-on-failure contract (see its class doc for
 * the full rationale), just AuthContext's RN `User` and this package's own fetch/save/unsave
 * functions underneath. This is the single seam both SaveBeachButton and the Saved tab's grid read
 * and write through (#100), so the two never disagree about what's saved.
 */
export function SavedBeachesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);

  // Keyed on uid rather than the User object itself — AuthContext hands out a new User reference
  // on things like its email-verification refresh, which isn't a new session and shouldn't
  // re-fetch the saved set.
  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      setIsReady(true);
      return;
    }

    let cancelled = false;
    setIsReady(false);
    fetchSavedBeaches(user)
      .then((beaches) => {
        if (!cancelled) {
          setSavedIds(new Set(beaches.map((beach) => beach.id)));
          setIsReady(true);
        }
      })
      .catch(() => {
        // Fail quiet: the star/grid just show unsaved rather than blocking on or retrying a
        // failed fetch. The next sign-in gets another attempt.
        if (!cancelled) {
          setSavedIds(new Set());
          setIsReady(true);
        }
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
        // whatever the set looks like when the failure lands, so an unrelated toggle that happened
        // in between (a different beach, or a later tap on this same one) isn't clobbered.
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
    <SavedBeachesContext.Provider value={{ isSaved, toggleSave, isReady }}>
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
