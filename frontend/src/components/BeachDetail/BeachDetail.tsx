import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FaArrowLeft, FaWater } from "react-icons/fa6";
import { usePredictions } from "./hooks/usePredictions";
import { useBeach } from "./hooks/useBeach";
import { currentSofiaHour, isOutsideLegalWindow } from "./utils/legalWindow";
import { todayInSofia } from "./utils/forecastWindow";
import { useToast } from "../Layout/Toast/ToastContext";
import { Timeline } from "./Timeline/Timeline";
import { DayOutlook } from "./DayOutlook/DayOutlook";
import { ForecastStrip } from "./ForecastStrip/ForecastStrip";
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
  // Which Forecast Strip chip is showing: null means Today, which keeps this page's original
  // Timeline behavior untouched; any other value is a future calendar date (YYYY-MM-DD) that
  // swaps the Timeline area for that day's Day Outlook (#83) instead. Transient UI state only —
  // never the URL — so a reload always lands back on Today. See #85.
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = todayInSofia();
  const styles = getBeachDetailStyles({ backHovered });
  const { show: showToast, dismiss: dismissToast } = useToast();
  // Curated beach photo takes priority over the seeded map-pin image (see
  // ADR 0001) — it's the more informative hero image — falling back to the
  // pin, then the generic icon, if a beach has neither.
  const imageDescriptor = getBeachImage(beachId);
  const imageSrc = imageDescriptor?.hero.src ?? mapImageDataUrl;

  // Fires on every beach detail page load (including switching straight from one
  // beach to another, since BeachDetailView remounts on beachId — see the key={beachId}
  // note on BeachDetail above) rather than once per session.
  //
  // Cleanup dismisses the toast it showed: without this, StrictMode's dev-only
  // mount→cleanup→mount double-invoke leaves the first mount's toast on screen
  // and the second mount adds another, showing the disclaimer twice.
  useEffect(() => {
    const id = showToast(DISCLAIMER_MESSAGE);
    return () => dismissToast(id);
  }, [beachId, showToast, dismissToast]);

  // Client-side navigation doesn't get the browser's free anchor-scroll (that only fires on a
  // real document load), so a #comments link from the beach list card has to be honored by hand.
  useEffect(() => {
    if (location.hash !== "#comments") return;
    document.getElementById("comments")?.scrollIntoView({ block: "start" });
  }, [beachId, location.hash]);
  return (
    <section aria-label="Beach detail">
      <div style={styles.page}>
        <div style={styles.main}>
          <div style={styles.titleRow}>
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
            <div
              style={{
                display: "flex",
                flex: 1,
                justifyContent: "space-between",
                // The title's line box runs taller than the button (inherited
                // body line-height on a 2rem heading), so a stretch/center
                // alignment leaves slack below the button before it even hits
                // titleRow's margin. Pinning to flex-start removes that slack
                // so the only gap left is the intentional margin below.
                alignItems: "flex-start",
              }}
            >
              <h2 style={styles.title}>{beachName ?? "Beach"}</h2>
              <SaveBeachButton beachId={beachId} />
            </div>
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

            <div style={styles.badges }>
              <ForecastStrip
                beachId={beachId}
                selectedDate={selectedDate ?? today}
                onSelect={(date) => setSelectedDate(date === today ? null : date)}
              />

              {selectedDate ? (
                <DayOutlook beachId={beachId} date={selectedDate} isUnguarded={isUnguarded} />
              ) : (
                predictions.status === "success" && (
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
                      beachId={beachId}
                    />
                    <p style={styles.meta}>
                      Predictions for {predictions.data.date}
                      {predictions.refreshing && (
                        <span style={styles.refreshing}>Refreshing…</span>
                      )}
                    </p>
                  </>
                )
              )}
            </div>
          </div>

          {quirkNotes && <p style={styles.description}>{quirkNotes}</p>}

          {selectedDate === null && predictions.status === "loading" && <p>Loading predictions…</p>}

          {selectedDate === null && predictions.status === "error" && (
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
