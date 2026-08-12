import { BEACH_AREAS } from "../../../shared/types/Beach";
import { AreaCard } from "../AreaCard/AreaCard";
import { SeaSummaryCard } from "../SeaSummaryCard/SeaSummaryCard";
import type { DashboardSummaryProps } from "./interfaces";
import { getDashboardSummaryStyles } from "./styles/DashboardSummary.styles";

export function DashboardSummary({ date, bySea, byArea }: DashboardSummaryProps) {
  const styles = getDashboardSummaryStyles();
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
