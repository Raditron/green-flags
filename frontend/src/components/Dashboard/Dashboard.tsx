import { BEACH_AREAS } from "../../shared/types/Beach";
import { AreaCard } from "./AreaCard/AreaCard";
import { SeaSummaryCard } from "./SeaSummaryCard/SeaSummaryCard";
import { getDashboardStyles } from "./styles/Dashboard.styles";
import { useDailySummary } from "./hooks/useDailySummary";
import type { AreaAverageAttributes, AverageAttributes } from "./interfaces";

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

interface DashboardSummaryProps {
  date: string;
  bySea: AverageAttributes;
  byArea: AreaAverageAttributes[];
}

function DashboardSummary({ date, bySea, byArea }: DashboardSummaryProps) {
  const styles = getDashboardStyles();
  // North-to-south, the existing Area ordering (BEACH_AREAS mirrors the backend's BeachAreas
  // enum declaration order) — filtered to only the Areas actually present in today's response,
  // so an Area with zero beaches reporting simply doesn't get a card.
  const attributesByArea = new Map(byArea.map((attributes) => [attributes.area, attributes]));
  const orderedAreas = BEACH_AREAS.filter((area) => attributesByArea.has(area));

  return (
    <>
      <SeaSummaryCard date={date} attributes={bySea} />

      <ul style={styles.grid}>
        {orderedAreas.map((area) => (
          <AreaCard key={area} attributes={attributesByArea.get(area)!} />
        ))}
      </ul>
    </>
  );
}
