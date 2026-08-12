import { useId, useState } from "react";
import type { GuardStatusBadgeProps } from "./interfaces";
import { getGuardStatusBadgeStyles } from "./styles/GuardStatusBadge.styles";

/**
 * Guard-status pill shown next to a beach's name — an icon plus a
 * hover-triggered tooltip explaining what the icon means. Self-contained the
 * same way `SaveBeachButton` is: it owns its own hover state and generates
 * its own tooltip id internally, so the parent only has to pass in what the
 * icon/label/tooltip should say.
 */
export const GuardStatusBadge = ({
  icon: Icon,
  variant,
  ariaLabel,
  tooltipText,
}: GuardStatusBadgeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const tooltipId = useId();
  const styles = getGuardStatusBadgeStyles({ variant, isHovered });

  return (
    <span
      aria-describedby={tooltipId}
      aria-label={ariaLabel}
      style={styles.label}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Icon aria-hidden="true" style={styles.icon} />
      <span
        aria-hidden={!isHovered}
        id={tooltipId}
        role="tooltip"
        style={styles.tooltip}
      >
        {tooltipText}
      </span>
    </span>
  );
};
