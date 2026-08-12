import { Tooltip } from "../../../Tooltip/Tooltip";
import type { GuardStatusBadgeProps } from "./interfaces";
import { getGuardStatusBadgeStyles } from "./styles/GuardStatusBadge.styles";

/**
 * Guard-status pill shown next to a beach's name — an icon plus a
 * hover/focus-triggered tooltip explaining what the icon means. The pill
 * styling (accent color, background chip) is what's unique to this badge;
 * the tooltip bubble itself is the shared `Tooltip`.
 */
export const GuardStatusBadge = ({
  icon: Icon,
  variant,
  ariaLabel,
  tooltipText,
}: GuardStatusBadgeProps) => {
  const styles = getGuardStatusBadgeStyles({ variant });

  return (
    <Tooltip text={tooltipText} align="end">
      <span aria-label={ariaLabel} style={styles.label}>
        <Icon aria-hidden="true" style={styles.icon} />
      </span>
    </Tooltip>
  );
};
