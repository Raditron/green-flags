import { DashboardSummary } from "./DashboardSummary/DashboardSummary";
import { getDashboardStyles } from "./styles/Dashboard.styles";
import { useDailySummary } from "./hooks/useDailySummary";

export function Dashboard() {
  const summary = useDailySummary();
  const styles = getDashboardStyles();

  return (
    <section aria-label="Today">
      <h1 style={styles.title}>Today</h1>

      {summary.status === "loading" && <p>Loading today's summary…</p>}

      {summary.status === "error" && (
        <p style={styles.error}>Could not load today's summary: {summary.message}</p>
      )}

      {summary.status === "success" && summary.data.averageAttributesBySea.sampleSize === 0 && (
        <p style={styles.empty}>No predictions yet for today — check back soon.</p>
      )}

      {summary.status === "success" && summary.data.averageAttributesBySea.sampleSize > 0 && (
        <DashboardSummary
          date={summary.data.date}
          bySea={summary.data.averageAttributesBySea}
          byArea={summary.data.averageAttributesByArea}
        />
      )}
    </section>
  );
}
