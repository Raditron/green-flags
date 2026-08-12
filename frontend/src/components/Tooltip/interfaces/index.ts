import type { ReactNode } from "react";

// Which edge of the trigger the bubble hangs its own edge from. "start"
// pins the bubble's left edge to the trigger's left (room to grow right —
// use near a container's left/center), "end" pins its right edge to the
// trigger's right (room to grow left — use near a container's right edge,
// so the bubble doesn't spill off screen), "center" splits the difference.
export type TooltipAlign = "start" | "center" | "end";

export interface TooltipProps {
  text: string;
  children: ReactNode;
  align?: TooltipAlign;
}
