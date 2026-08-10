import { useMemo, useState } from "react";
import { distanceKm } from "../../../shared/data/utils/geo";
import type { Coordinates } from "../../../shared/data/utils/geo";
import type { Beach, BeachArea, BeachWithDistance, FlagColor } from "../../../shared/types/Beach";
import type { UserLocationState } from "../../../shared/hooks/useUserLocation";

export type SelectedArea = BeachArea | "all";

// Nearest beach must be within this to count as the visitor's Detected Area; farther than this
// and Selected Area falls back to "all" (see CONTEXT.md's "Detected Area" and ADR 0005).
const DETECTED_AREA_MAX_KM = 50;

export interface UseBeachFiltersResult {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedFlags: FlagColor[];
  toggleFlag: (flagColor: FlagColor) => void;
  selectedArea: SelectedArea;
  setSelectedArea: (area: SelectedArea) => void;
  /** True while selectedArea still reflects geolocation rather than a manual pick — drives the "near you" hint. */
  isAreaAutoDetected: boolean;
  filteredBeaches: BeachWithDistance[];
}

function findNearestBeach(beaches: Beach[], from: Coordinates): BeachWithDistance | undefined {
  return beaches.reduce<BeachWithDistance | undefined>((nearest, beach) => {
    const distance = distanceKm(from, beach);
    if (!nearest || distance < (nearest.distanceKm ?? Infinity)) {
      return { ...beach, distanceKm: distance };
    }
    return nearest;
  }, undefined);
}

export function useBeachFilters(beaches: Beach[], userLocation: UserLocationState): UseBeachFiltersResult {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlags, setSelectedFlags] = useState<FlagColor[]>([]);
  // null until the visitor picks an area themselves; while null, Selected Area (below) tracks
  // Detected Area live instead of a value we'd have to sync in on a later render — see ADR 0005's
  // "brief blocking wait, then settle": deriving this at render time (not via an effect) is what
  // keeps the first paint from ever showing the unfiltered list before narrowing to Detected Area.
  const [manualArea, setManualArea] = useState<SelectedArea | null>(null);

  const beachesWithDistance = useMemo<BeachWithDistance[]>(() => {
    if (userLocation.status !== "success") return beaches;
    return beaches.map(beach => ({ ...beach, distanceKm: distanceKm(userLocation.coords, beach) }));
  }, [beaches, userLocation]);

  const detectedArea = useMemo<BeachArea | undefined>(() => {
    if (userLocation.status !== "success" || beaches.length === 0) return undefined;
    const nearest = findNearestBeach(beaches, userLocation.coords);
    return nearest && (nearest.distanceKm ?? Infinity) <= DETECTED_AREA_MAX_KM ? nearest.area : undefined;
  }, [beaches, userLocation]);

  const selectedArea = manualArea ?? detectedArea ?? "all";
  const isAreaAutoDetected = manualArea === null && detectedArea !== undefined;

  function toggleFlag(flagColor: FlagColor) {
    setSelectedFlags(current =>
      current.includes(flagColor) ? current.filter(flag => flag !== flagColor) : [...current, flagColor],
    );
  }

  const filteredBeaches = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    // Selected Area scopes both search and the flag filter below it — see CONTEXT.md's "Selected Area".
    const withinArea =
      selectedArea === "all" ? beachesWithDistance : beachesWithDistance.filter(beach => beach.area === selectedArea);

    const matched = withinArea.filter(beach => {
      // A name match wins outright: a beach the visitor searched for by name surfaces regardless
      // of the flag filter and regardless of what its actual flag color is. The flag filter only
      // kicks in once the search box is empty.
      if (trimmedQuery.length > 0) {
        return beach.name.toLowerCase().includes(trimmedQuery);
      }

      if (selectedFlags.length === 0) return true;
      return beach.currentFlagColor !== undefined && selectedFlags.includes(beach.currentFlagColor);
    });

    if (userLocation.status !== "success") return matched;

    // Nearest-first once the visitor's location is known; falls back to the list's incoming
    // (north-to-south) order otherwise since Array.prototype.sort is stable.
    return [...matched].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }, [beachesWithDistance, searchQuery, selectedFlags, selectedArea, userLocation.status]);

  return {
    searchQuery,
    setSearchQuery,
    selectedFlags,
    toggleFlag,
    selectedArea,
    setSelectedArea: setManualArea,
    isAreaAutoDetected,
    filteredBeaches,
  };
}
