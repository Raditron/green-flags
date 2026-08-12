import { useId, useState } from "react";
import type { TooltipProps } from "./interfaces";
import { getTooltipStyles } from "./styles/Tooltip.styles";

/**
 * App-styled stand-in for the native `title` attribute: wrap any trigger
 * (icon, badge, chip, button) and it gets a hover/focus-revealed bubble in
 * the app's own popover treatment instead of the browser's unstyled
 * tooltip. Functionally the same contract as `title` — point at it, see the
 * text — plus keyboard-focus support `title` never reliably gave you.
 *
 * Lifted out of GuardStatusBadge, which used to own this pattern locally;
 * that badge (and any other spot doing the same thing) now composes this
 * instead of re-implementing it.
 */
export function Tooltip({ text, children, align = "start" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();
  const styles = getTooltipStyles({ align, isVisible });

  return (
    <span
      aria-describedby={tooltipId}
      style={styles.wrapper}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <span aria-hidden={!isVisible} id={tooltipId} role="tooltip" style={styles.bubble}>
        {text}
      </span>
    </span>
  );
}
