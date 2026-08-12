import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useSavedBeachesList } from "./hooks/useSavedBeachesList";
import { SavedBeachesGrid } from "./SavedBeachesGrid/SavedBeachesGrid";
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
  // loading shouldn't get bounced to Today on their own bookmark.
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <section aria-label="Your beaches">
      <h1 style={styles.title}>Your beaches</h1>

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
