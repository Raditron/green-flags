import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FaArrowLeft, FaWater } from "react-icons/fa6";
import { usePredictions } from "./hooks/usePredictions";
import { useBeach } from "./hooks/useBeach";
import { currentSofiaHour, isOutsideLegalWindow } from "./utils/legalWindow";
import { useToast } from "../Layout/Toast/ToastContext";
import { Timeline } from "./Timeline/Timeline";
import { ReportFlagButton } from "./ReportFlagButton/ReportFlagButton";
import { SaveBeachButton } from "../SaveBeachButton/SaveBeachButton";
import { CommentSection } from "./CommentSection/CommentSection";
import { getBeachDetailStyles } from "./styles/BeachDetail.styles";
import { getBeachImage } from "../../shared/data/images";

interface LocationState {
  beachName?: string;
  mapImageDataUrl?: string;
  quirkNotes?: string;
  isUnguarded?: boolean;
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
  const {
    name: beachName,
    mapImageDataUrl,
    quirkNotes,
    isUnguarded,
  } = useBeach(beachId, {
    name: locationState?.beachName,
    mapImageDataUrl: locationState?.mapImageDataUrl,
    quirkNotes: locationState?.quirkNotes,
    isUnguarded: locationState?.isUnguarded,
  });
  const predictions = usePredictions(beachId);
  const outsideLegalWindow = isOutsideLegalWindow();
  const currentHour = outsideLegalWindow ? null : currentSofiaHour();
  const [backHovered, setBackHovered] = useState(false);
  const styles = getBeachDetailStyles({ backHovered });
  const { show: showToast } = useToast();
  // Curated beach photo takes priority over the seeded map-pin image (see
  // ADR 0001) — it's the more informative hero image — falling back to the
  // pin, then the generic icon, if a beach has neither.
  const imageDescriptor = getBeachImage(beachId);
  const imageSrc = imageDescriptor?.hero.src ?? mapImageDataUrl;

  // Fires on every beach detail page load (including switching straight from one
  // beach to another, since BeachDetailView remounts on beachId — see the key={beachId}
  // note on BeachDetail above) rather than once per session.
  useEffect(() => {
    showToast(DISCLAIMER_MESSAGE);
  }, [beachId, showToast]);

  // Client-side navigation doesn't get the browser's free anchor-scroll (that only fires on a
  // real document load), so a #comments link from the beach list card has to be honored by hand.
  useEffect(() => {
    if (location.hash !== "#comments") return;
    document.getElementById("comments")?.scrollIntoView({ block: "start" });
  }, [beachId, location.hash]);
  return (
    <section aria-label="Beach detail">
      <div style={styles.page}>
        <div style={styles.backContainer}>
          <Link
            to="/beaches"
            style={styles.back}
            aria-label="Back to beaches"
            onMouseEnter={() => setBackHovered(true)}
            onMouseLeave={() => setBackHovered(false)}
          >
            <FaArrowLeft style={styles.backIcon} />
          </Link>
        </div>

        <div style={styles.main}>
          <div style={styles.titleRow}>
            <h2 style={styles.title}>{beachName ?? "Beach"}</h2>
            <SaveBeachButton beachId={beachId} />
          </div>

          <div style={styles.heroRow}>
            <div style={styles.imageArea}>
              {imageSrc ? (
                <img
                  src={imageSrc}
                  width={imageDescriptor?.hero.width}
                  height={imageDescriptor?.hero.height}
                  alt=""
                  style={styles.image}
                />
              ) : (
                <div style={styles.iconChip}>
                  <FaWater style={styles.icon} />
                </div>
              )}
            </div>

            <div style={styles.badges}>
              {predictions.status === "success" && (
                <>
                  {outsideLegalWindow && (
                    <p style={styles.offWindow}>
                      No lifeguard on duty — estimate only
                    </p>
                  )}
                  <Timeline
                    hourlyPredictions={predictions.data.hourlyPredictions}
                    desaturated={outsideLegalWindow}
                    currentHour={currentHour}
                    updatedAt={predictions.updatedAt}
                    isUnguarded={isUnguarded}
                  />
                  <p style={styles.meta}>
                    Predictions for {predictions.data.date}
                    {predictions.refreshing && (
                      <span style={styles.refreshing}>Refreshing…</span>
                    )}
                  </p>
                </>
              )}
            </div>
          </div>

          {quirkNotes && <p style={styles.description}>{quirkNotes}</p>}

          {/* Gated on isUnguarded === false rather than !isUnguarded: while it's still
              unknown (undefined, before useBeach resolves it) this fails closed and keeps
              the report flow off screen instead of flashing it for an unguarded beach. */}
          {isUnguarded === false && <ReportFlagButton beachId={beachId} />}

          {predictions.status === "loading" && <p>Loading predictions…</p>}

          {predictions.status === "error" && (
            <p style={styles.error}>
              Could not load predictions: {predictions.message}
            </p>
          )}

          {/* Lives under the rest of the page, always visible (YouTube-style), rather than
              behind the icon-button modal it used to open — see CommentSection per #70. */}
          <CommentSection beachId={beachId} />
        </div>
      </div>
    </section>
  );
}
