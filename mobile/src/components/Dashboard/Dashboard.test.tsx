import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TEST_SAFE_AREA_METRICS } from "../../test/safeAreaMetrics";
import { ThemeProvider } from "../../theme/ThemeContext";
import { Dashboard } from "./Dashboard";
import type { DailySummaryState } from "./hooks/useDailySummary";
import type { AreaAverageAttributes, AverageAttributes } from "./interfaces";

let mockState: DailySummaryState;

// Mirrors the auth module's component-test seam (see AccountControl.test.tsx): mock the colocated
// hook wholesale rather than the network, per #95's "component-level rendering test mocking the
// colocated hook" acceptance criterion.
jest.mock("./hooks/useDailySummary", () => ({
  useDailySummary: () => mockState,
}));

const SEA_ATTRIBUTES: AverageAttributes = {
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

const AREA_ATTRIBUTES: AreaAverageAttributes = { ...SEA_ATTRIBUTES, area: "Varna" };

function renderDashboard() {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("Dashboard", () => {
  it("shows a loading message while the summary is loading", async () => {
    mockState = { status: "loading" };
    await renderDashboard();

    expect(screen.getByText("Loading today's summary…")).toBeOnTheScreen();
  });

  it("shows a distinct error message on failure, not conflated with the empty state", async () => {
    mockState = { status: "error", message: "Daily summary request failed with status 503" };
    await renderDashboard();

    expect(screen.getByText("Could not load today's summary: Daily summary request failed with status 503")).toBeOnTheScreen();
    expect(screen.queryByText("No predictions yet for today — check back soon.")).toBeNull();
  });

  it("shows a friendly empty state when today has zero predictions yet", async () => {
    mockState = {
      status: "success",
      data: {
        date: "2026-08-18",
        averageAttributesBySea: { ...SEA_ATTRIBUTES, sampleSize: 0, beachCount: 0 },
        averageAttributesByArea: [],
      },
    };
    await renderDashboard();

    expect(screen.getByText("No predictions yet for today — check back soon.")).toBeOnTheScreen();
  });

  it("renders the sea-wide summary and a per-Area breakdown on success", async () => {
    mockState = {
      status: "success",
      data: {
        date: "2026-08-18",
        averageAttributesBySea: SEA_ATTRIBUTES,
        averageAttributesByArea: [AREA_ATTRIBUTES],
      },
    };
    await renderDashboard();

    expect(screen.getByLabelText("Sea-wide summary")).toBeOnTheScreen();
    expect(screen.getByText("Varna")).toBeOnTheScreen();
  });
});
