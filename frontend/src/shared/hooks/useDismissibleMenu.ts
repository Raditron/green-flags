import { useEffect } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";

/**
 * Closes an open menu on the two standard dismissal gestures — a click outside its
 * container, or Escape — so callers don't have to wire this up per menu instance.
 * Only listens while `open`, so idle menus don't pay for global listeners.
 */
export function useDismissibleMenu(
  containerRef: RefObject<HTMLElement | null>,
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>
): void {
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, containerRef, setOpen]);
}
