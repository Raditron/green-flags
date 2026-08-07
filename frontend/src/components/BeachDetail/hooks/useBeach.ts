import { useEffect, useState } from "react";
import { fetchBeach } from "../data/fetchBeach";

interface KnownBeach {
  name?: string;
  mapImageDataUrl?: string;
}

interface BeachInfo {
  name: string | undefined;
  mapImageDataUrl: string | undefined;
}

/**
 * Prefers name/image passed via router navigation state (set together, from the same
 * beach record, by BeachListCard's Link); falls back to fetching the beach list for
 * direct links/refreshes, where neither is known yet.
 */
export function useBeach(beachId: string, known: KnownBeach): BeachInfo {
  const [info, setInfo] = useState<BeachInfo>({ name: known.name, mapImageDataUrl: known.mapImageDataUrl });

  useEffect(() => {
    if (known.name) {
      setInfo({ name: known.name, mapImageDataUrl: known.mapImageDataUrl });
      return;
    }

    let cancelled = false;

    fetchBeach(beachId)
      .then((beach) => {
        if (!cancelled && beach) {
          setInfo({ name: beach.name, mapImageDataUrl: beach.mapImageDataUrl });
        }
      })
      .catch(() => {
        // Name/image are cosmetic — a failed lookup just leaves the page on its generic fallbacks.
      });

    return () => {
      cancelled = true;
    };
  }, [beachId, known.name, known.mapImageDataUrl]);

  return info;
}
