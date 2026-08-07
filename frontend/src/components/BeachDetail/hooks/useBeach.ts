import { useEffect, useState } from "react";
import { fetchBeach } from "../data/fetchBeach";
import type { Beach } from "../../../shared/types/Beach";

type KnownBeach = Partial<Pick<Beach, "name" | "mapImageDataUrl" | "quirkNotes">>;
type BeachInfo = KnownBeach;

/**
 * Prefers name/image/quirkNotes passed via router navigation state (set together, from the
 * same beach record, by BeachListCard's Link); falls back to fetching the beach list for
 * direct links/refreshes, where none of it is known yet.
 */
export function useBeach(beachId: string, known: KnownBeach): BeachInfo {
  const [info, setInfo] = useState<BeachInfo>({
    name: known.name,
    mapImageDataUrl: known.mapImageDataUrl,
    quirkNotes: known.quirkNotes,
  });

  useEffect(() => {
    if (known.name) {
      setInfo({ name: known.name, mapImageDataUrl: known.mapImageDataUrl, quirkNotes: known.quirkNotes });
      return;
    }

    let cancelled = false;

    fetchBeach(beachId)
      .then((beach) => {
        if (!cancelled && beach) {
          setInfo({ name: beach.name, mapImageDataUrl: beach.mapImageDataUrl, quirkNotes: beach.quirkNotes });
        }
      })
      .catch(() => {
        // Name/image/quirkNotes are cosmetic — a failed lookup just leaves the page on its generic fallbacks.
      });

    return () => {
      cancelled = true;
    };
  }, [beachId, known.name, known.mapImageDataUrl, known.quirkNotes]);

  return info;
}
