import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { usePredictions } from "./hooks/usePredictions";
import { useBeachName } from "./hooks/useBeachName";
import { currentSofiaHour, isOutsideLegalWindow } from "./utils/legalWindow";
import { DisclaimerBanner } from "./DisclaimerBanner/DisclaimerBanner";
import { Timeline } from "./Timeline/Timeline";
import { ReportFlagButton } from "./ReportFlagButton/ReportFlagButton";
import { getBeachDetailStyles } from "./styles/BeachDetail.styles";

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
  const currentHour = outsideLegalWindow ? null : currentSofiaHour();
  const [backHovered, setBackHovered] = useState(false);
  const styles = getBeachDetailStyles({ backHovered });

  return (
    <section aria-label="Beach detail">
      <Link
        to="/"
        style={styles.back}
        onMouseEnter={() => setBackHovered(true)}
        onMouseLeave={() => setBackHovered(false)}
      >
        ← Back to beaches
      </Link>
      <h2>{beachName ?? "Beach"}</h2>
      <DisclaimerBanner />
      <ReportFlagButton beachId={beachId} />

      {predictions.status === "loading" && <p>Loading predictions…</p>}

      {predictions.status === "error" && (
        <p style={styles.error}>Could not load predictions: {predictions.message}</p>
      )}

      {predictions.status === "success" && (
        <>
          <p style={styles.meta}>
            Predictions for {predictions.data.date} · Updated{" "}
            {new Date(predictions.updatedAt).toLocaleTimeString()}
            {predictions.refreshing && <span style={styles.refreshing}>Refreshing…</span>}
          </p>

          {outsideLegalWindow && (
            <p style={styles.offWindow}>No lifeguard on duty — estimate only</p>
          )}

          <Timeline
            hourlyPredictions={predictions.data.hourlyPredictions}
            desaturated={outsideLegalWindow}
            currentHour={currentHour}
          />
        </>
      )}
    </section>
  );
}
