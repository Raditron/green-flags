import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "../../../theme/ThemeContext";
import { AreaCard } from "./AreaCard";
import type { AreaAverageAttributes } from "../interfaces";

const BASE_ATTRIBUTES: AreaAverageAttributes = {
  area: "Varna",
  dominantFlagColor: "yellow",
  flagColorDistribution: { green: 20, yellow: 70, red: 10 },
  dominantRipCurrentRisk: "moderate",
  ripCurrentRiskDistribution: { low: 20, moderate: 70, high: 10 },
  averageConfidencePercent: 60,
  confidenceBasisDistribution: { certain: 40, blended: 40, prior: 20 },
  averageWindSpeedMps: 5.1,
  readableWindSpeed: "moderate breeze",
  averageWaveHeightM: 0.8,
  readableSeaState: "moderate",
  averageWavePeriodS: 4.0,
  stormWarningActivePercent: 0,
  sampleSize: 12,
  beachCount: 3,
};

function renderCard(attributes: AreaAverageAttributes) {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <ThemeProvider>
      <AreaCard attributes={attributes} />
    </ThemeProvider>,
  );
}

describe("AreaCard", () => {
  it("renders the Area name, flag headline, and readings/beach-count footer", async () => {
    await renderCard(BASE_ATTRIBUTES);

    expect(screen.getByText("Varna")).toBeOnTheScreen();
    expect(screen.getByText("Yellow flag · caution advised")).toBeOnTheScreen();
    expect(screen.getByText("Based on 12 readings across 3 beaches")).toBeOnTheScreen();
  });

  it("shows a storm badge (with the tooltip-equivalent text folded into its accessibilityLabel) only when stormWarningActivePercent is above zero", async () => {
    await renderCard(BASE_ATTRIBUTES);
    expect(screen.queryByLabelText(/Storm warning active/)).toBeNull();

    await renderCard({ ...BASE_ATTRIBUTES, stormWarningActivePercent: 25 });
    expect(screen.getByLabelText("Storm warning active for 25% of today's readings")).toBeOnTheScreen();
    expect(screen.getByText("25%")).toBeOnTheScreen();
  });

  it("caveats the footer with 'limited data' when the sample is thin", async () => {
    await renderCard({ ...BASE_ATTRIBUTES, beachCount: 1, sampleSize: 3 });

    expect(screen.getByText(/— limited data$/)).toBeOnTheScreen();
  });
});
