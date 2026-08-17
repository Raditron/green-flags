import { useEffect, useState } from "react";

// Below this width, the title/greeting, nav pills, and right-side controls no longer
// comfortably fit on one row — informally, where a signed-in "Hello, {name}" greeting starts
// crowding the pills, in the small-tablet/large-phone range. A single named constant so
// Layout.tsx's two hand-authored layouts and this hook can never drift apart on the value.
export const COMPACT_HEADER_BREAKPOINT_PX = 720;

const QUERY = `(max-width: ${COMPACT_HEADER_BREAKPOINT_PX}px)`;

/**
 * Whether the header should render its collapsed, two-row layout. Wraps window.matchMedia at
 * COMPACT_HEADER_BREAKPOINT_PX, mirroring the prefers-color-scheme pattern in
 * Theme/ThemeContext.tsx, so the row-collapse decision comes from a deliberate breakpoint
 * rather than incidental flex-wrap.
 */
export function useIsCompactHeader(): boolean {
  const [isCompact, setIsCompact] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    function handleChange() {
      setIsCompact(media.matches);
    }
    // The initial useState read can race a media query that changes between mount and this
    // effect attaching its listener — re-sync once here rather than trust the constructor value.
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return isCompact;
}
