import { useBeaches } from "./hooks/useBeaches";
import { useBeachFilters } from "./hooks/useBeachFilters";
import { getBeachListStyles } from "./styles/BeachList.styles";
import { BeachListCard } from "./BeachListCard/BeachListCard";
import { BeachListFilters } from "./BeachListFilters/BeachListFilters";

export function BeachList() {
  const beaches = useBeaches();
  const styles = getBeachListStyles();
  const { searchQuery, setSearchQuery, selectedFlags, toggleFlag, filteredBeaches } = useBeachFilters(
    beaches.status === "success" ? beaches.data : [],
  );

  return (
    <section aria-label="Beaches">
      {beaches.status === "loading" && <p>Loading beaches…</p>}

      {beaches.status === "error" && (
        <p style={styles.error}>Could not load beaches: {beaches.message}</p>
      )}

      {beaches.status === "success" && (
        <>
          <BeachListFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFlags={selectedFlags}
            onToggleFlag={toggleFlag}
          />

          {filteredBeaches.length === 0 ? (
            <p style={styles.empty}>No beaches match your search.</p>
          ) : (
            <ul style={styles.list}>
              {filteredBeaches.map(beach => (
                <BeachListCard key={beach.id} beach={beach} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
