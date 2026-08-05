import { useHealthcheck } from "./hooks/useHealthcheck";
import styles from "./styles/SystemStatus.module.css";

export function SystemStatus() {
  const healthcheck = useHealthcheck();

  return (
    <section className={styles.card} aria-live="polite">
      <h2 className={styles.title}>System status</h2>

      {healthcheck.status === "loading" && <p>Checking API + database connection…</p>}

      {healthcheck.status === "error" && (
        <p className={styles.error}>Could not reach the API: {healthcheck.message}</p>
      )}

      {healthcheck.status === "success" && (
        <dl className={styles.details}>
          <dt>Status</dt>
          <dd>{healthcheck.data.status}</dd>
          <dt>Ping count</dt>
          <dd>{healthcheck.data.pingCount}</dd>
          <dt>Last ping</dt>
          <dd>{new Date(healthcheck.data.lastPingAt).toLocaleString()}</dd>
        </dl>
      )}
    </section>
  );
}
