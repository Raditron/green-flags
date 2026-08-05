import { useEffect, useState } from "react";
import { fetchBeachName } from "../data/fetchBeachName";

/** Prefers the name passed via router navigation state; falls back to fetching the beach list for direct links/refreshes. */
export function useBeachName(beachId: string, knownName: string | undefined): string | undefined {
  const [name, setName] = useState(knownName);

  useEffect(() => {
    if (knownName) {
      setName(knownName);
      return;
    }

    let cancelled = false;

    fetchBeachName(beachId)
      .then((fetchedName) => {
        if (!cancelled) setName(fetchedName);
      })
      .catch(() => {
        // Name is cosmetic — a failed lookup just leaves the heading on its generic fallback.
      });

    return () => {
      cancelled = true;
    };
  }, [beachId, knownName]);

  return name;
}
