import { useEffect, useState } from "react";
import { fetchBeach } from "../data/fetchBeach";
import type { Beach } from "../../../shared/types/Beach";

type KnownBeach = Partial<Pick<Beach, "name" | "mapImageDataUrl" | "quirkNotes" | "isUnguarded">>;
type BeachInfo = KnownBeach;

/**
 * Prefers name/image/quirkNotes/isUnguarded passed via router navigation state (set together,
 * from the same beach record, by BeachListCard's Link); falls back to fetching the beach list
 * for direct links/refreshes, where none of it is known yet. isUnguarded isn't cosmetic like the
 * rest — ReportFlagButton reads it to keep the report flow off unguarded beaches' pages.
 */
export function useBeach(beachId: string, known: KnownBeach): BeachInfo {
  const [info, setInfo] = useState<BeachInfo>({
    name: known.name,
    mapImageDataUrl: known.mapImageDataUrl,
    quirkNotes: known.quirkNotes,
    isUnguarded: known.isUnguarded,
  });

  useEffect(() => {
    if (known.name) {
      setInfo({
        name: known.name,
        mapImageDataUrl: known.mapImageDataUrl,
        quirkNotes: known.quirkNotes,
        isUnguarded: known.isUnguarded,
      });
      return;
    }

    let cancelled = false;

    fetchBeach(beachId)
      .then((beach) => {
        if (!cancelled && beach) {
          setInfo({
            name: beach.name,
            mapImageDataUrl: beach.mapImageDataUrl,
            quirkNotes: beach.quirkNotes,
            isUnguarded: beach.isUnguarded,
          });
        }
      })
      .catch(() => {
        // Name/image/quirkNotes are cosmetic — a failed lookup just leaves the page on its generic fallbacks.
        // isUnguarded defaults to undefined here too, which ReportFlagButton treats as "unknown"
        // and keeps the report flow hidden for, rather than risking a report on an unguarded beach.
      });

    return () => {
      cancelled = true;
    };
  }, [beachId, known.name, known.mapImageDataUrl, known.quirkNotes, known.isUnguarded]);

  return info;
}
