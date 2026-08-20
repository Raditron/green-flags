import { useEffect, useState } from "react";
import { currentSofiaHour } from "../../utils/legalWindow";

// RN port of frontend/src/components/BeachDetail/Timeline/hooks/useLiveClock.ts, verbatim.
const SOFIA_CLOCK_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Sofia",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// Re-read every 30s rather than every second — the display only ever shows minute
// precision, so a per-second timer would just be extra renders for no visible benefit.
const TICK_INTERVAL_MS = 30_000;

export interface LiveClock {
  /** "HH:MM" in Europe/Sofia local time. */
  label: string;
  /** The Europe/Sofia hour (0-23) the label falls in, for driving hour-level selection. */
  hour: number;
}

function readClock(): LiveClock {
  const now = new Date();
  return { label: SOFIA_CLOCK_FORMATTER.format(now), hour: currentSofiaHour(now) };
}

/** Live Europe/Sofia clock, ticking on an interval so callers can track "now" without
 * re-deriving it from a parent render (which only happens on unrelated state changes). */
export function useLiveClock(): LiveClock {
  const [clock, setClock] = useState<LiveClock>(readClock);

  useEffect(() => {
    const id = setInterval(() => setClock(readClock()), TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return clock;
}
