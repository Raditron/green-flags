import { useBeaches } from "./hooks/useBeaches";
import { getBeachListStyles } from "./styles/BeachList.styles";
import { BeachListCard } from "./BeachListCard/BeachListCard";

export function BeachList() {
  const beaches = useBeaches();
  const styles = getBeachListStyles();

  return (
    <section aria-label="Beaches">
      {beaches.status === "loading" && <p>Loading beaches…</p>}

      {beaches.status === "error" && (
        <p style={styles.error}>
          Could not load beaches: {beaches.message}
        </p>
      )}

      {beaches.status === "success" && (
        <ul style={styles.list}>
          {beaches.data.map(beach => (
            <BeachListCard key={beach.id} beach={beach} />
          ))}
        </ul>
      )}
    </section>
  );
}
