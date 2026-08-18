import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "../../../theme/ThemeContext";
import { DashboardSummary } from "./DashboardSummary";
import type { AreaAverageAttributes, AverageAttributes } from "../interfaces";

const SEA_ATTRIBUTES: AverageAttributes = {
  dominantFlagColor: "green",
  flagColorDistribution: { green: 100, yellow: 0, red: 0 },
  dominantRipCurrentRisk: "low",
  ripCurrentRiskDistribution: { low: 100, moderate: 0, high: 0 },
  averageConfidencePercent: 80,
  confidenceBasisDistribution: { certain: 80, blended: 20, prior: 0 },
  averageWindSpeedMps: 2.5,
  readableWindSpeed: "light breeze",
  averageWaveHeightM: 0.3,
  readableSeaState: "rippled",
  averageWavePeriodS: 2.8,
  stormWarningActivePercent: 0,
  sampleSize: 50,
  beachCount: 10,
};

function areaAttributes(area: AreaAverageAttributes["area"]): AreaAverageAttributes {
  return { ...SEA_ATTRIBUTES, area };
}

function renderSummary(byArea: AreaAverageAttributes[]) {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <ThemeProvider>
      <DashboardSummary date="2026-08-18" bySea={SEA_ATTRIBUTES} byArea={byArea} />
    </ThemeProvider>,
  );
}

describe("DashboardSummary", () => {
  it("renders the sea-wide summary plus one AreaCard per Area present in byArea", async () => {
    await renderSummary([areaAttributes("Varna"), areaAttributes("Burgas")]);

    expect(screen.getByLabelText("Sea-wide summary")).toBeOnTheScreen();
    expect(screen.getByText("Varna")).toBeOnTheScreen();
    expect(screen.getByText("Burgas")).toBeOnTheScreen();
  });

  it("omits an Area with no card in byArea rather than rendering an empty card for it", async () => {
    await renderSummary([areaAttributes("Varna")]);

    expect(screen.queryByText("Sozopol")).toBeNull();
  });

  it("orders Area cards north-to-south (BEACH_AREAS order), not by byArea's own order", async () => {
    // Burgas listed before Varna here, but BEACH_AREAS runs Varna (index 3) before Burgas (index
    // 9) — asserting on the rendered tree's own text order (rather than a plain array of the two
    // names) is what actually exercises DashboardSummary's BEACH_AREAS-filter/order step, not just
    // AreaCard's own rendering.
    await renderSummary([areaAttributes("Burgas"), areaAttributes("Varna")]);

    const renderedText = JSON.stringify(screen.toJSON());
    expect(renderedText.indexOf("Varna")).toBeLessThan(renderedText.indexOf("Burgas"));
  });
});
