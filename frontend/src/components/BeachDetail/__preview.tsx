// TEMP: visual QA harness for the display-page redesign, not part of the feature.
// Deleted after screenshotting. Bypasses data fetching (useBeach/usePredictions hit real
// endpoints) so the new hero image / back arrow / confidence meter / toast can be screenshotted
// without a running backend.
import { useState } from "react";
import { FaArrowLeft, FaWater } from "react-icons/fa6";
import { Timeline } from "./Timeline/Timeline";
import { useToast } from "../Layout/Toast/ToastContext";
import { getBeachDetailStyles } from "./styles/BeachDetail.styles";
import type { HourlyPrediction } from "./interfaces";

const mockPredictions: HourlyPrediction[] = [
  { hour: 9, flagColor: "green", ripCurrentRisk: "low", confidence: { percent: 92, basis: "certain", sampleSize: 0 }, readableWindSpeed: "calm", readableSeaState: "calm" },
  { hour: 10, flagColor: "green", ripCurrentRisk: "low", confidence: { percent: 78, basis: "blended", sampleSize: 4 }, readableWindSpeed: "light breeze", readableSeaState: "rippled" },
  { hour: 11, flagColor: "yellow", ripCurrentRisk: "moderate", confidence: { percent: 45, basis: "blended", sampleSize: 1 }, readableWindSpeed: "moderate breeze", readableSeaState: "slight" },
  { hour: 12, flagColor: "red", ripCurrentRisk: "high", confidence: { percent: 15, basis: "prior", sampleSize: 0 }, readableWindSpeed: "strong gale", readableSeaState: "high" },
];

function MockDetailSection({ withImage, quirkNotes }: { withImage: boolean; quirkNotes?: string }) {
  const [backHovered, setBackHovered] = useState(false);
  const styles = getBeachDetailStyles({ backHovered });
  const { show } = useToast();

  return (
    <section aria-label="Beach detail preview" style={{ width: 640, marginBottom: 40 }}>
      <div style={styles.page}>
        <div style={styles.backContainer}>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={styles.back}
            aria-label="Back to beaches"
            onMouseEnter={() => setBackHovered(true)}
            onMouseLeave={() => setBackHovered(false)}
          >
            <FaArrowLeft style={styles.backIcon} />
          </a>
        </div>

        <div style={styles.main}>
          <h2 style={styles.title}>{withImage ? "Sunset Cove" : "Windy Point (no image)"}</h2>

          <div style={styles.heroRow}>
            <div style={styles.imageArea}>
              {withImage ? (
                <img
                  src={
                    "data:image/svg+xml;base64," +
                    btoa(
                      '<svg xmlns="http://www.w3.org/2000/svg" width="370" height="200"><rect width="370" height="200" fill="#8da9c4"/><circle cx="185" cy="100" r="60" fill="#f9fbfc"/></svg>'
                    )
                  }
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
              <p style={styles.meta}>Predictions for 2026-08-07</p>
              <Timeline
                hourlyPredictions={mockPredictions}
                currentHour={10}
                updatedAt={new Date().toISOString()}
                beachId="preview-beach"
              />
            </div>
          </div>

          {quirkNotes && <p style={styles.description}>{quirkNotes}</p>}

          <button type="button" onClick={() => show("Unofficial estimate — not the lifeguard's flag")}>
            Show toast
          </button>
        </div>
      </div>
    </section>
  );
}

export function BeachDetailPreview() {
  return (
    <div style={{ display: "flex", gap: 40, flexWrap: "wrap", padding: 24 }}>
      <MockDetailSection
        withImage={true}
        quirkNotes="Rocky patch near the north pier — watch your step at low tide. Popular with windsurfers after 4pm."
      />
      <MockDetailSection withImage={false} />
    </div>
  );
}
