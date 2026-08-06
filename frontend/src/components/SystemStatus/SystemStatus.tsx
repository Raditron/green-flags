import { useHealthcheck } from "./hooks/useHealthcheck";
import { getSystemStatusStyles } from "./styles/SystemStatus.styles";

export function SystemStatus() {
  const healthcheck = useHealthcheck();
  const styles = getSystemStatusStyles();

  return (
    <section style={styles.card} aria-live="polite">
      <h2 style={styles.title}>System status</h2>

      {healthcheck.status === "loading" && <p>Checking API + database connection…</p>}

      {healthcheck.status === "error" && (
        <p style={styles.error}>Could not reach the API: {healthcheck.message}</p>
      )}

      {healthcheck.status === "success" && (
        <dl style={styles.details}>
          <dt style={styles.detailsTerm}>Status</dt>
          <dd style={styles.detailsDescription}>{healthcheck.data.status}</dd>
          <dt style={styles.detailsTerm}>Ping count</dt>
          <dd style={styles.detailsDescription}>{healthcheck.data.pingCount}</dd>
          <dt style={styles.detailsTerm}>Last ping</dt>
          <dd style={styles.detailsDescription}>{new Date(healthcheck.data.lastPingAt).toLocaleString()}</dd>
        </dl>
      )}
    </section>
  );
}
