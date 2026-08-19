import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "../../../theme/ThemeContext";
import { SeaSummaryCard } from "./SeaSummaryCard";
import type { AverageAttributes } from "../interfaces";

const BASE_ATTRIBUTES: AverageAttributes = {
  dominantFlagColor: "green",
  flagColorDistribution: { green: 80, yellow: 20, red: 0 },
  dominantRipCurrentRisk: "low",
  ripCurrentRiskDistribution: { low: 90, moderate: 10, high: 0 },
  averageConfidencePercent: 75,
  confidenceBasisDistribution: { certain: 60, blended: 30, prior: 10 },
  averageWindSpeedMps: 3.2,
  readableWindSpeed: "gentle breeze",
  averageWaveHeightM: 0.4,
  readableSeaState: "slight",
  averageWavePeriodS: 3.1,
  stormWarningActivePercent: 0,
  sampleSize: 42,
  beachCount: 8,
};

function renderCard(attributes: AverageAttributes) {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <ThemeProvider>
      <SeaSummaryCard date="2026-08-18" attributes={attributes} />
    </ThemeProvider>,
  );
}

describe("SeaSummaryCard", () => {
  it("renders the flag headline, conditions sentence, and readings/beach-count footer", async () => {
    await renderCard(BASE_ATTRIBUTES);

    expect(screen.getByLabelText("Sea-wide summary")).toBeOnTheScreen();
    expect(screen.getByText("Green flag · safe to swim")).toBeOnTheScreen();
    expect(screen.getByText("Small waves, easy swimming · Comfortable breeze on the skin")).toBeOnTheScreen();
    expect(screen.getByText("Based on 42 readings across 8 beaches")).toBeOnTheScreen();
  });

  it("shows the storm-warning banner only when stormWarningActivePercent is above zero", async () => {
    await renderCard(BASE_ATTRIBUTES);
    expect(screen.queryByText(/Storm warning active/)).toBeNull();

    await renderCard({ ...BASE_ATTRIBUTES, stormWarningActivePercent: 40 });
    expect(screen.getByText("Storm warning active for 40% of today's readings")).toBeOnTheScreen();
  });

  it("caveats the footer with 'limited data' when the sample is thin (below the low-sample thresholds)", async () => {
    await renderCard({ ...BASE_ATTRIBUTES, beachCount: 1, sampleSize: 2 });

    expect(screen.getByText(/— limited data$/)).toBeOnTheScreen();
  });
});
