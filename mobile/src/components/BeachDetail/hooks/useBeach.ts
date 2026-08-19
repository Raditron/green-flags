import { useEffect, useState } from "react";
import { fetchBeach } from "../data/fetchBeach";
import type { Beach } from "../../../shared/types/Beach";

type KnownBeach = Partial<Pick<Beach, "name" | "quirkNotes" | "isUnguarded">>;
type BeachInfo = KnownBeach;

/**
 * RN port of frontend/src/components/BeachDetail/hooks/useBeach.ts. Prefers name/quirkNotes/
 * isUnguarded passed via `BeachDetailRouteParams` (set together, from the same beach record, by
 * BeachList's `navigation.navigate` call — mirroring frontend's router `state`); falls back to
 * fetching the beach list for a direct/deep-linked navigation, where none of it is known yet.
 * isUnguarded isn't cosmetic like the rest — a future ticket's report-the-flag feature (#98,
 * mirroring frontend's useReportFlag) will read it to keep the report flow off unguarded beaches'
 * pages, same as frontend already does.
 */
export function useBeach(beachId: string, known: KnownBeach): BeachInfo {
  const [info, setInfo] = useState<BeachInfo>({
    name: known.name,
    quirkNotes: known.quirkNotes,
    isUnguarded: known.isUnguarded,
  });

  useEffect(() => {
    if (known.name) {
      setInfo({
        name: known.name,
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
            quirkNotes: beach.quirkNotes,
            isUnguarded: beach.isUnguarded,
          });
        }
      })
      .catch(() => {
        // Name/quirkNotes are cosmetic — a failed lookup just leaves the screen on its generic
        // fallbacks. isUnguarded defaults to undefined here too, which a future report-the-flag
        // feature (#98) will treat as "unknown" and keep hidden for, rather than risking a report
        // on an unguarded beach.
      });

    return () => {
      cancelled = true;
    };
  }, [beachId, known.name, known.quirkNotes, known.isUnguarded]);

  return info;
}
