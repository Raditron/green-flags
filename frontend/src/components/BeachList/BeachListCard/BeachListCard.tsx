import { useId, useState, type FocusEvent } from "react";
import { Link } from "react-router-dom";
import type { BeachListCardProps } from "./interfaces/BeachListCard.interface";
import {
  getBeachListCardStyles,
  getFlagIconColorStyle,
} from "./styles/BeachListCard.styles";
import { getBeachListStyles } from "../styles/BeachList.styles";
import { getFlagStatusText } from "../../../shared/styles/flagColor";
import { getBeachImage } from "../../../shared/data/images";
import { formatDistanceKm } from "../../../shared/data/utils/geo";
import { SaveBeachButton } from "../../SaveBeachButton/SaveBeachButton";
import {
  FaFlag,
  FaLifeRing,
  FaTriangleExclamation,
  FaWater,
} from "react-icons/fa6";

export const BeachListCard = ({ beach }: BeachListCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isReportHovered, setIsReportHovered] = useState(false);
  const [isGuardStatusHovered, setIsGuardStatusHovered] = useState(false);
  const guardStatusTooltipId = useId();
  const styles = getBeachListCardStyles({
    isHovered,
    isFocused,
    isReportHovered,
    isGuardStatusHovered,
  });
  const listStyles = getBeachListStyles();
  const flagStatusText = getFlagStatusText(beach.currentFlagColor);
  const isUnguarded = beach.isUnguarded;
  const GuardStatusIcon = isUnguarded ? FaTriangleExclamation : FaLifeRing;
  // Curated beach photo takes priority over the seeded map-pin image (see
  // ADR 0001) — it's the more informative thumbnail — falling back to the
  // pin, then the generic icon, if a beach has neither.
  const imageSrc = getBeachImage(beach.id) ?? beach.mapImageDataUrl;
  // Focus bubbles up from either the media link or the report link below, so
  // the raised/outline treatment reads as one card regardless of which
  // control has keyboard focus. Only clear it once focus actually leaves
  // the card, not when it moves between the two links inside it.
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocused(false);
    }
  }

  return (
    <li style={listStyles.item}>
      <div
        style={styles.card}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
      >
        <Link
          to={`/beaches/${beach.id}`}
          state={{
            beachName: beach.name,
            mapImageDataUrl: beach.mapImageDataUrl,
            quirkNotes: beach.quirkNotes,
            isUnguarded: beach.isUnguarded,
          }}
          style={styles.mediaLink}
        >
          <div style={styles.imageArea}>
            {imageSrc ? (
              <img src={imageSrc} alt="" style={styles.image} />
            ) : (
              <div style={styles.iconChip}>
                <FaWater style={styles.icon} />
              </div>
            )}
            {beach.currentConfidencePercent !== undefined && (
              <span style={styles.confidence}>
                {beach.currentConfidencePercent}%
              </span>
            )}
          </div>

          <div style={styles.content}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={styles.name}>{beach.name}</span>
              <span
                aria-describedby={guardStatusTooltipId}
                aria-label={isUnguarded ? "Unguarded beach" : "Guarded beach"}
                style={
                  isUnguarded ? styles.unguardedLabel : styles.guardedLabel
                }
                onMouseEnter={() => setIsGuardStatusHovered(true)}
                onMouseLeave={() => setIsGuardStatusHovered(false)}
              >
                <GuardStatusIcon
                  aria-hidden="true"
                  style={styles.guardStatusIcon}
                />
                <span
                  aria-hidden={!isGuardStatusHovered}
                  id={guardStatusTooltipId}
                  role="tooltip"
                  style={styles.guardStatusTooltip}
                >
                  {isUnguarded
                    ? "This beach is unguarded. Swim with extra caution."
                    : "This beach is guarded by lifeguards."}
                </span>
              </span>
            </div>
            <div style={styles.statusRow}>
              {flagStatusText ? (
                <>
                  <FaFlag
                    style={{
                      ...styles.flagIcon,
                      ...getFlagIconColorStyle(beach.currentFlagColor),
                    }}
                  />
                  <span style={styles.statusText}>{flagStatusText}</span>
                </>
              ) : (
                <span style={styles.statusText}>No report yet</span>
              )}
            </div>
            {beach.distanceKm !== undefined && (
              <span style={styles.distanceText}>
                {formatDistanceKm(beach.distanceKm)}
              </span>
            )}
          </div>
        </Link>

        <div style={styles.divider} />

        <div style={styles.actions}>
          <div style={{ display: "flex", flex: 1 }}>
            <SaveBeachButton beachId={beach.id} withLabel />
          </div>
          <div style={{ display: "flex", flex: 1 }}>
            <Link
              to={`/beaches/${beach.id}`}
              state={{
                beachName: beach.name,
                mapImageDataUrl: beach.mapImageDataUrl,
                quirkNotes: beach.quirkNotes,
                isUnguarded: beach.isUnguarded,
              }}
              style={styles.reportButton}
              onMouseEnter={() => setIsReportHovered(true)}
              onMouseLeave={() => setIsReportHovered(false)}
            >
              <FaFlag style={styles.reportIcon} />
              Report
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
};
