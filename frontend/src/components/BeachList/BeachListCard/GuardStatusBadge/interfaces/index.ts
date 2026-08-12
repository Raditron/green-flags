import type { IconType } from "react-icons";

export type GuardStatusVariant = "guarded" | "unguarded";

export interface GuardStatusBadgeProps {
  icon: IconType;
  variant: GuardStatusVariant;
  ariaLabel: string;
  tooltipText: string;
}
