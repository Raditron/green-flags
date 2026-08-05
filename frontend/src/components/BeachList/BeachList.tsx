import { Link } from "react-router-dom";
import { useBeaches } from "./hooks/useBeaches";
import styles from "./styles/BeachList.module.css";

export function BeachList() {
  const beaches = useBeaches();

  return (
    <section aria-label="Beaches">
      {beaches.status === "loading" && <p>Loading beaches…</p>}

      {beaches.status === "error" && (
        <p className={styles.error}>Could not load beaches: {beaches.message}</p>
      )}

      {beaches.status === "success" && (
        <ul className={styles.list}>
          {beaches.data.map((beach) => (
            <li key={beach.id} className={styles.row}>
              <Link
                to={`/beaches/${beach.id}`}
                state={{ beachName: beach.name }}
                className={styles.link}
              >
                {beach.mapImageDataUrl && (
                  <img src={beach.mapImageDataUrl} alt="" width={56} height={56} className={styles.pin} />
                )}
                <span className={styles.name}>{beach.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
