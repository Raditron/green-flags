import { useMemo, useState } from "react";
import { distanceKm } from "../../../shared/data/utils/geo";
import type { Coordinates } from "../../../shared/data/utils/geo";
import type {
  Beach,
  BeachArea,
  BeachWithDistance,
  FlagColor,
} from "../../../shared/types/Beach";
import type { UserLocationState } from "../../../shared/hooks/useUserLocation";

export type SelectedArea = BeachArea | "all";

// Nearest beach must be within this to count as the visitor's Detected Area; farther than this
// and Selected Area falls back to "all" (see CONTEXT.md's "Detected Area" and ADR 0005).
const DETECTED_AREA_MAX_KM = 50;

export interface UseBeachFiltersResult {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  // Single-select, unlike frontend's `selectedFlags: FlagColor[]` toggle array — #96's acceptance
  // criteria asks for the flag filter to narrow to "a single flag color", not a multi-select set.
  selectedFlag: FlagColor | null;
  setSelectedFlag: (flagColor: FlagColor | null) => void;
  selectedArea: SelectedArea;
  setSelectedArea: (area: SelectedArea) => void;
  isAreaAutoDetected: boolean;
  filteredBeaches: BeachWithDistance[];
  clearFilters: () => void;
}

function findNearestBeach(
  beaches: Beach[],
  from: Coordinates,
): BeachWithDistance | undefined {
  return beaches.reduce<BeachWithDistance | undefined>((nearest, beach) => {
    const distance = distanceKm(from, beach);
    if (!nearest || distance < (nearest.distanceKm ?? Infinity)) {
      return { ...beach, distanceKm: distance };
    }
    return nearest;
  }, undefined);
}

/**
 * RN port of frontend/src/components/BeachList/hooks/useBeachFilters.ts — same Detected Area /
 * distance derivation, same manual-area-overrides-detected-area precedence, same "search takes
 * priority over the flag filter while a query is present" behavior. Differs only in the flag
 * filter's shape (single-select here vs. frontend's multi-select toggle array) and the absence of
 * the guarded/unguarded filter, which isn't part of #96's scope.
 */
export function useBeachFilters(
  beaches: Beach[],
  userLocation: UserLocationState,
): UseBeachFiltersResult {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlag, setSelectedFlag] = useState<FlagColor | null>(null);
  // null until the visitor picks an area themselves; while null, Selected Area (below) tracks
  // Detected Area live instead of a value we'd have to sync in on a later render — see ADR 0005's
  // "brief blocking wait, then settle": deriving this at render time (not via an effect) is what
  // keeps the first paint from ever showing the unfiltered list before narrowing to Detected Area.
  const [manualArea, setManualArea] = useState<SelectedArea | null>(null);

  const beachesWithDistance = useMemo<BeachWithDistance[]>(() => {
    if (userLocation.status !== "success") return beaches;
    return beaches.map((beach) => ({
      ...beach,
      distanceKm: distanceKm(userLocation.coords, beach),
    }));
  }, [beaches, userLocation]);

  const detectedArea = useMemo<BeachArea | undefined>(() => {
    if (userLocation.status !== "success" || beaches.length === 0)
      return undefined;
    const nearest = findNearestBeach(beaches, userLocation.coords);
    return nearest && (nearest.distanceKm ?? Infinity) <= DETECTED_AREA_MAX_KM
      ? nearest.area
      : undefined;
  }, [beaches, userLocation]);

  const selectedArea = manualArea ?? detectedArea ?? "all";
  const isAreaAutoDetected = manualArea === null && detectedArea !== undefined;

  function clearFilters() {
    setManualArea(null);
    setSelectedFlag(null);
    setSearchQuery("");
  }

  const filteredBeaches = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    const withinArea =
      selectedArea === "all"
        ? beachesWithDistance
        : beachesWithDistance.filter((beach) => beach.area === selectedArea);

    const matched = withinArea.filter((beach) => {
      if (trimmedQuery.length > 0) {
        return beach.name.toLowerCase().includes(trimmedQuery);
      }

      if (selectedFlag === null) return true;

      return beach.currentFlagColor === selectedFlag;
    });

    if (userLocation.status !== "success") return matched;

    return [...matched].sort(
      (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
    );
  }, [beachesWithDistance, searchQuery, selectedFlag, selectedArea, userLocation.status]);

  return {
    searchQuery,
    setSearchQuery,
    selectedFlag,
    setSelectedFlag,
    selectedArea,
    setSelectedArea: setManualArea,
    isAreaAutoDetected,
    filteredBeaches,
    clearFilters,
  };
}
