import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FaArrowLeft, FaWater } from "react-icons/fa6";
import { usePredictions } from "./hooks/usePredictions";
import { useBeach } from "./hooks/useBeach";
import { currentSofiaHour, isOutsideLegalWindow } from "./utils/legalWindow";
import { useToast } from "../Layout/Toast/ToastContext";
import { Timeline } from "./Timeline/Timeline";
import { ReportFlagButton } from "./ReportFlagButton/ReportFlagButton";
import { getBeachDetailStyles } from "./styles/BeachDetail.styles";

interface LocationState {
  beachName?: string;
  mapImageDataUrl?: string;
  openReportPicker?: boolean;
}

const DISCLAIMER_MESSAGE = "Unofficial estimate — not the lifeguard's flag";

// Keying on beachId forces a remount when navigating beach-to-beach without an intervening
// unmount (e.g. browser back/forward), so cached/loading state never leaks across beaches.
export function BeachDetail() {
  const { beachId } = useParams<{ beachId: string }>();
  return beachId ? <BeachDetailView key={beachId} beachId={beachId} /> : null;
}

function BeachDetailView({ beachId }: { beachId: string }) {
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const { name: beachName, mapImageDataUrl } = useBeach(beachId, {
    name: locationState?.beachName,
    mapImageDataUrl: locationState?.mapImageDataUrl,
  });
  const predictions = usePredictions(beachId);
  const outsideLegalWindow = isOutsideLegalWindow();
  const currentHour = outsideLegalWindow ? null : currentSofiaHour();
  const [backHovered, setBackHovered] = useState(false);
  const styles = getBeachDetailStyles({ backHovered });
  const { show: showToast } = useToast();

  // Fires on every beach detail page load (including switching straight from one
  // beach to another, since BeachDetailView remounts on beachId — see the key={beachId}
  // note on BeachDetail above) rather than once per session.
  useEffect(() => {
    showToast(DISCLAIMER_MESSAGE);
  }, [beachId, showToast]);

  return (
    <section aria-label="Beach detail">
      <div style = {styles.backContainer}>
        <Link
          to="/"
          style={styles.back}
          aria-label="Back to beaches"
          onMouseEnter={() => setBackHovered(true)}
          onMouseLeave={() => setBackHovered(false)}
        >
          <FaArrowLeft style={styles.backIcon} />
        </Link>
      </div>

      <div style={styles.content}>
        <div style={styles.imageArea}>
          {mapImageDataUrl ? (
            <img src={mapImageDataUrl} alt="" style={styles.image} />
          ) : (
            <div style={styles.iconChip}>
              <FaWater style={styles.icon} />
            </div>
          )}
        </div>

        <h2>{beachName ?? "Beach"}</h2>
        <ReportFlagButton
          beachId={beachId}
          autoOpen={locationState?.openReportPicker ?? false}
        />

        {predictions.status === "loading" && <p>Loading predictions…</p>}

        {predictions.status === "error" && (
          <p style={styles.error}>
            Could not load predictions: {predictions.message}
          </p>
        )}

        {predictions.status === "success" && (
          <>
            <p style={styles.meta}>
              Predictions for {predictions.data.date} · Updated{" "}
              {new Date(predictions.updatedAt).toLocaleTimeString()}
              {predictions.refreshing && (
                <span style={styles.refreshing}>Refreshing…</span>
              )}
            </p>

            {outsideLegalWindow && (
              <p style={styles.offWindow}>
                No lifeguard on duty — estimate only
              </p>
            )}

            <Timeline
              hourlyPredictions={predictions.data.hourlyPredictions}
              desaturated={outsideLegalWindow}
              currentHour={currentHour}
            />
          </>
        )}
      </div>
    </section>
  );
}
