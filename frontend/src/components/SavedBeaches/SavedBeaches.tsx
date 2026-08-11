import { Navigate } from "react-router-dom";
import type { Beach } from "../../shared/types/Beach";
import { useAuth } from "../../auth/AuthContext";
import { useSavedBeaches } from "../../saved/SavedBeachesContext";
import { useSavedBeachesList } from "./hooks/useSavedBeachesList";
import { BeachListCard } from "../BeachList/BeachListCard/BeachListCard";
import { getBeachListStyles } from "../BeachList/styles/BeachList.styles";
import { getSavedBeachesStyles } from "./styles/SavedBeaches.styles";

/**
 * The signed-in visitor's shortlist: their saved Beaches in the same card grid as the main Beach
 * list, per #23's Implementation Decisions. No search or Area filtering here — out of scope for
 * this page.
 */
export function SavedBeaches() {
  const { user, loading: authLoading } = useAuth();
  const savedBeaches = useSavedBeachesList(user);
  const styles = getSavedBeachesStyles();

  // Wait for auth to resolve before redirecting — a signed-in visitor whose session is still
  // loading shouldn't get bounced to the Dashboard on their own bookmark.
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <section aria-label="Saved beaches">
      <h1 style={styles.title}>Saved</h1>

      {(authLoading || savedBeaches.status === "loading") && <p>Loading saved beaches…</p>}

      {savedBeaches.status === "error" && (
        <p style={getBeachListStyles().error}>
          Could not load saved beaches: {savedBeaches.message}
        </p>
      )}

      {savedBeaches.status === "success" && <SavedBeachesGrid beaches={savedBeaches.data} />}
    </section>
  );
}

function SavedBeachesGrid({ beaches }: { beaches: Beach[] }) {
  const { isSaved, isReady } = useSavedBeaches();
  const listStyles = getBeachListStyles();

  // Filtered against the live SavedBeachesContext, not this list's own fetch snapshot, so
  // unsaving a Beach from its star right here drops the card immediately, without a refetch.
  // Held back until the context's own fetch has settled (isReady): both fetches hit the same
  // endpoint independently and race on a direct page load (e.g. a bookmark), so filtering before
  // the context has caught up can flash — or wrongly show — an empty state for a visitor who
  // does have saved beaches. Until then, this page's own fresh fetch is trusted as-is.
  const stillSaved = isReady ? beaches.filter((beach) => isSaved(beach.id)) : beaches;

  if (stillSaved.length === 0) {
    return (
      <p style={listStyles.empty}>
        You haven't saved any beaches yet — tap the star on a beach in the list or on its detail
        page to add it here.
      </p>
    );
  }

  return (
    <ul style={listStyles.list}>
      {stillSaved.map((beach) => (
        <BeachListCard key={beach.id} beach={beach} />
      ))}
    </ul>
  );
}
