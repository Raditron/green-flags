import { useMemo, useState } from "react";
import type { Beach, FlagColor } from "../../../shared/types/Beach";

export interface UseBeachFiltersResult {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedFlags: FlagColor[];
  toggleFlag: (flagColor: FlagColor) => void;
  filteredBeaches: Beach[];
}

export function useBeachFilters(beaches: Beach[]): UseBeachFiltersResult {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlags, setSelectedFlags] = useState<FlagColor[]>([]);

  function toggleFlag(flagColor: FlagColor) {
    setSelectedFlags(current =>
      current.includes(flagColor) ? current.filter(flag => flag !== flagColor) : [...current, flagColor],
    );
  }

  const filteredBeaches = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    return beaches.filter(beach => {
      // A name match wins outright: a beach the visitor searched for by name
      // surfaces regardless of the flag filter and regardless of what its
      // actual flag color is. The flag filter only kicks in once the search
      // box is empty.
      if (trimmedQuery.length > 0) {
        return beach.name.toLowerCase().includes(trimmedQuery);
      }

      if (selectedFlags.length === 0) return true;
      return beach.currentFlagColor !== undefined && selectedFlags.includes(beach.currentFlagColor);
    });
  }, [beaches, searchQuery, selectedFlags]);

  return { searchQuery, setSearchQuery, selectedFlags, toggleFlag, filteredBeaches };
}
