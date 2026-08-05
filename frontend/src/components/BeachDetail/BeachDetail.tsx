import { Link, useLocation, useParams } from "react-router-dom";
import { usePredictions } from "./hooks/usePredictions";
import { useBeachName } from "./hooks/useBeachName";
import { isOutsideLegalWindow } from "./utils/legalWindow";
import { DisclaimerBanner } from "./DisclaimerBanner/DisclaimerBanner";
import { Timeline } from "./Timeline/Timeline";
import styles from "./styles/BeachDetail.module.css";

interface LocationState {
  beachName?: string;
}

// Keying on beachId forces a remount when navigating beach-to-beach without an intervening
// unmount (e.g. browser back/forward), so cached/loading state never leaks across beaches.
export function BeachDetail() {
  const { beachId } = useParams<{ beachId: string }>();
  return beachId ? <BeachDetailView key={beachId} beachId={beachId} /> : null;
}

function BeachDetailView({ beachId }: { beachId: string }) {
  const location = useLocation();
  const beachName = useBeachName(beachId, (location.state as LocationState | null)?.beachName);
  const predictions = usePredictions(beachId);
  const outsideLegalWindow = isOutsideLegalWindow();

  return (
    <section aria-label="Beach detail">
      <Link to="/" className={styles.back}>
        ← Back to beaches
      </Link>
      <h2>{beachName ?? "Beach"}</h2>
      <DisclaimerBanner />

      {predictions.status === "loading" && <p>Loading predictions…</p>}

      {predictions.status === "error" && (
        <p className={styles.error}>Could not load predictions: {predictions.message}</p>
      )}

      {predictions.status === "success" && (
        <>
          <p className={styles.meta}>
            Predictions for {predictions.data.date} · Updated{" "}
            {new Date(predictions.updatedAt).toLocaleTimeString()}
            {predictions.refreshing && <span className={styles.refreshing}>Refreshing…</span>}
          </p>

          {outsideLegalWindow && (
            <p className={styles.offWindow}>No lifeguard on duty — estimate only</p>
          )}

          <Timeline
            hourlyPredictions={predictions.data.hourlyPredictions}
            desaturated={outsideLegalWindow}
          />
        </>
      )}
    </section>
  );
}
