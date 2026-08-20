import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "../../../theme/ThemeContext";
import { DayOutlook } from "./DayOutlook";
import type { PredictionsState } from "../hooks/usePredictions";
import type { HourlyPrediction } from "../interfaces";

const mockUsePredictions = jest.fn<PredictionsState, [string, string?]>();
jest.mock("../hooks/usePredictions", () => ({
  usePredictions: (beachId: string, date?: string) => mockUsePredictions(beachId, date),
}));

const BEACH_ID = "beach-a";
const DATE = "2026-08-20";

function hour(overrides: Partial<HourlyPrediction> & { hour: number }): HourlyPrediction {
  return {
    flagColor: "green",
    ripCurrentRisk: "low",
    confidence: { percent: 90, basis: "certain", sampleSize: 0 },
    readableWindSpeed: "calm",
    readableSeaState: "calm",
    ...overrides,
  };
}

function renderOutlook(isUnguarded?: boolean) {
  return render(
    <ThemeProvider>
      <DayOutlook beachId={BEACH_ID} date={DATE} isUnguarded={isUnguarded} />
    </ThemeProvider>,
  );
}

describe("DayOutlook", () => {
  it("renders the worst-case hour's flag color, conditions sentence, caution, and hour mention", async () => {
    mockUsePredictions.mockReturnValue({
      status: "success",
      data: {
        beachId: BEACH_ID,
        date: DATE,
        issuedDate: "2026-08-14",
        hourlyPredictions: [
          hour({ hour: 9, flagColor: "green" }),
          hour({ hour: 15, flagColor: "red", ripCurrentRisk: "high" }),
          hour({ hour: 17, flagColor: "yellow" }),
        ],
      },
    });

    await renderOutlook();

    expect(screen.getByText("Red flag · no swimming")).toBeOnTheScreen();
    expect(screen.getByText("Worst around 15:00")).toBeOnTheScreen();
    expect(screen.getByText("Strong rip currents — stay close to shore")).toBeOnTheScreen();
    expect(screen.getByRole("progressbar", { name: "Confidence" })).toHaveAccessibilityValue({ now: 90 });
    expect(screen.getByText("Wind: calm")).toBeOnTheScreen();
    expect(screen.getByText("Sea: calm")).toBeOnTheScreen();
  });

  it("renders UnguardedNotice when the beach is unguarded", async () => {
    mockUsePredictions.mockReturnValue({
      status: "success",
      data: {
        beachId: BEACH_ID,
        date: DATE,
        issuedDate: "2026-08-14",
        hourlyPredictions: [hour({ hour: 12 })],
      },
    });

    await renderOutlook(true);

    expect(screen.getByText("Caution: unguarded beach")).toBeOnTheScreen();
  });

  it("does not render TimePicker or a live clock", async () => {
    mockUsePredictions.mockReturnValue({
      status: "success",
      data: {
        beachId: BEACH_ID,
        date: DATE,
        issuedDate: "2026-08-14",
        hourlyPredictions: [hour({ hour: 12 })],
      },
    });

    await renderOutlook();

    expect(screen.queryByLabelText("Choose prediction hour")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders a distinct message while loading", async () => {
    mockUsePredictions.mockReturnValue({ status: "loading" });
    await renderOutlook();
    expect(screen.getByText("Loading forecast…")).toBeOnTheScreen();
  });

  it("renders a distinct 'no forecast yet' message on not-found (404)", async () => {
    mockUsePredictions.mockReturnValue({ status: "not-found" });
    await renderOutlook();
    expect(screen.getByText("No forecast yet for this day")).toBeOnTheScreen();
  });

  it("renders a distinct 'couldn't load' message on a genuine fetch failure", async () => {
    mockUsePredictions.mockReturnValue({ status: "error", message: "network down" });
    await renderOutlook();
    expect(screen.getByText("Couldn't load this day: network down")).toBeOnTheScreen();
    expect(screen.queryByText("No forecast yet for this day")).toBeNull();
  });
});
