import { useState, type FocusEvent } from "react";
import { Link } from "react-router-dom";
import type { BeachListCardProps } from "./interfaces/BeachListCard.interface";
import { getBeachListCardStyles, getFlagDotStyle } from "./styles/BeachListCard.styles";
import { getBeachListStyles } from "../styles/BeachList.styles";
import { getFlagStatusText } from "../../../shared/styles/flagColor";
import { FaWater, FaFlag } from "react-icons/fa6";

export const BeachListCard = ({ beach }: BeachListCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isReportHovered, setIsReportHovered] = useState(false);
  const styles = getBeachListCardStyles({ isHovered, isFocused, isReportHovered });
  const listStyles = getBeachListStyles();
  const flagStatusText = getFlagStatusText(beach.currentFlagColor);
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
          state={{ beachName: beach.name, mapImageDataUrl: beach.mapImageDataUrl }}
          style={styles.mediaLink}
        >
          <div style={styles.imageArea}>
            {beach.mapImageDataUrl ? (
              <img src={beach.mapImageDataUrl} alt="" style={styles.image} />
            ) : (
              <div style={styles.iconChip}>
                <FaWater style={styles.icon} />
              </div>
            )}
            {beach.currentConfidencePercent !== undefined && (
              <span style={styles.confidence}>{beach.currentConfidencePercent}%</span>
            )}
          </div>

          <div style={styles.content}>
            <span style={styles.name}>{beach.name}</span>
            <div style={styles.statusRow}>
              {flagStatusText ? (
                <>
                  <span
                    style={{ ...styles.flagDot, ...getFlagDotStyle(beach.currentFlagColor) }}
                  />
                  <span style={styles.statusText}>{flagStatusText}</span>
                </>
              ) : (
                <span style={styles.statusText}>No report yet</span>
              )}
            </div>
          </div>
        </Link>

        <div style={styles.divider} />

        <div style={styles.actions}>
          <Link
            to={`/beaches/${beach.id}`}
            state={{ beachName: beach.name, mapImageDataUrl: beach.mapImageDataUrl, openReportPicker: true }}
            style={styles.reportButton}
            onMouseEnter={() => setIsReportHovered(true)}
            onMouseLeave={() => setIsReportHovered(false)}
          >
            <FaFlag style={styles.reportIcon} />
            Report
          </Link>
        </div>
      </div>
    </li>
  );
};
