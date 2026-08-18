import { useBeaches } from "./hooks/useBeaches";
import { useBeachFilters } from "./hooks/useBeachFilters";
import { useUserLocation } from "../../shared/hooks/useUserLocation";
import { getBeachListStyles } from "./styles/BeachList.styles";
import { BeachListCard } from "./BeachListCard/BeachListCard";
import { BeachListFilters } from "./BeachListFilters/BeachListFilters";

export function BeachList() {
  const beaches = useBeaches();
  const userLocation = useUserLocation();
  const styles = getBeachListStyles();
  const {
    searchQuery,
    setSearchQuery,
    selectedFlags,
    toggleFlag,
    selectedArea,
    setSelectedArea,
    isAreaAutoDetected,
    filteredBeaches,
    guardedFilter,
    setGuardedFilter,
    clearFilters,
  } = useBeachFilters(
    beaches.status === "success" ? beaches.data : [],
    userLocation,
  );

  // Hold the list back behind a brief loading state while geolocation resolves, rather than
  // rendering every beach and then narrowing to Detected Area a moment later — see ADR 0005.
  const isFindingArea =
    beaches.status === "success" && userLocation.status === "loading";

  return (
    <section aria-label="All beaches">
      {beaches.status === "loading" && <p>Loading beaches…</p>}

      {beaches.status === "error" && (
        <p style={styles.error}>Could not load beaches: {beaches.message}</p>
      )}

      {isFindingArea && <p>Finding your area…</p>}

      {beaches.status === "success" && !isFindingArea && (
        <>
          <BeachListFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFlags={selectedFlags}
            onToggleFlag={toggleFlag}
            selectedArea={selectedArea}
            onAreaChange={setSelectedArea}
            isAreaAutoDetected={isAreaAutoDetected}
            guardedFilter={guardedFilter}
            onGuardedFilterChange={setGuardedFilter}
            onClearFilters={clearFilters}
          />

          {filteredBeaches.length === 0 ? (
            <p style={styles.empty}>No beaches match your search.</p>
          ) : (
            <ul style={styles.list}>
              {filteredBeaches.map((beach) => (
                <BeachListCard key={beach.id} beach={beach} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
