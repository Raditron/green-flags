import { useState } from "react";
import { Link } from "react-router-dom";
import type { BeachListCardProps } from "./interfaces/BeachListCard.interface";
import { getBeachListCardStyles, getFlagDotStyle } from "./styles/BeachListCard.styles";

export const BeachListCard = ({ beach }: BeachListCardProps) => {
  const [linkHovered, setLinkHovered] = useState(false);
  const styles = getBeachListCardStyles({ linkHovered });

  return (
    <div>
      <li key={beach.id} style={styles.row}>
        <Link
          to={`/beaches/${beach.id}`}
          state={{ beachName: beach.name }}
          style={styles.link}
          onMouseEnter={() => setLinkHovered(true)}
          onMouseLeave={() => setLinkHovered(false)}
        >
          {beach.mapImageDataUrl && (
            <img
              src={beach.mapImageDataUrl}
              alt=""
              width={56}
              height={56}
              style={styles.pin}
            />
          )}
          <span style={styles.name}>{beach.name}</span>
          {beach.currentFlagColor && (
            <span style={styles.flagBadge}>
              <span style={{ ...styles.flagDot, ...getFlagDotStyle(beach.currentFlagColor) }} />
              {beach.currentConfidencePercent !== undefined && (
                <span style={styles.confidence}>
                  {beach.currentConfidencePercent}%
                </span>
              )}
            </span>
          )}
        </Link>
      </li>
    </div>
  );
};
