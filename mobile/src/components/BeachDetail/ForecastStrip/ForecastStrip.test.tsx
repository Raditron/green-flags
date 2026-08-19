import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "../../../theme/ThemeContext";
import { ForecastStrip } from "./ForecastStrip";
import type { PredictionsState } from "../hooks/usePredictions";
import type { HourlyPrediction } from "../interfaces";

const mockUsePredictions = jest.fn<PredictionsState, [string, string?]>();
jest.mock("../hooks/usePredictions", () => ({
  usePredictions: (beachId: string, date?: string) => mockUsePredictions(beachId, date),
}));

const BEACH_ID = "beach-a";
// "Today" in Europe/Sofia for this fixed instant.
const TODAY = "2026-08-13";
const DATES = ["2026-08-13", "2026-08-14", "2026-08-15", "2026-08-16", "2026-08-17", "2026-08-18", "2026-08-19"];

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

function successState(flagColor: HourlyPrediction["flagColor"]): PredictionsState {
  return {
    status: "success",
    data: {
      beachId: BEACH_ID,
      date: TODAY,
      issuedDate: TODAY,
      hourlyPredictions: [hour({ hour: 12, flagColor })],
    },
  };
}

function renderStrip(props: Partial<{ selectedDate: string }> = {}) {
  return render(
    <ThemeProvider>
      <ForecastStrip beachId={BEACH_ID} {...props} />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date("2026-08-13T10:00:00Z"));
});

afterEach(() => {
  jest.useRealTimers();
});

describe("ForecastStrip", () => {
  it("renders exactly 7 chips: Today, then the next 6 calendar dates", async () => {
    mockUsePredictions.mockReturnValue({ status: "loading" });
    await renderStrip();

    expect(screen.getAllByRole("button")).toHaveLength(7);
    expect(screen.getByRole("button", { name: "Today: loading forecast" })).toBeOnTheScreen();
    // 2026-08-14 is a Friday.
    expect(screen.getByRole("button", { name: "Fri: loading forecast" })).toBeOnTheScreen();
  });

  it("gives each chip its own independent state — one failure doesn't affect the others", async () => {
    mockUsePredictions.mockImplementation((_beachId, date) => {
      if (date === DATES[0]) return { status: "loading" };
      if (date === DATES[1]) return successState("red");
      if (date === DATES[2]) return { status: "error", message: "network down" };
      if (date === DATES[3]) return { status: "not-found" };
      return successState("green");
    });

    await renderStrip();

    expect(screen.getByRole("button", { name: "Today: loading forecast" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Fri: Red flag · no swimming" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Sat: forecast unavailable" })).toBeDisabled();
    // Sun is not-found (outside the marine wave-data horizon) — its chip renders nothing at all,
    // rather than a muted "unavailable" one, so it never shows up as a button.
    expect(screen.queryByRole("button", { name: "Sun: forecast unavailable" })).toBeNull();
    expect(screen.getAllByRole("button", { name: /Green flag/ })).toHaveLength(3);
    expect(screen.getAllByRole("button")).toHaveLength(6);
  });

  it("fetches each chip's day independently by beachId and date", async () => {
    mockUsePredictions.mockReturnValue({ status: "loading" });
    await renderStrip();

    for (const date of DATES) {
      expect(mockUsePredictions).toHaveBeenCalledWith(BEACH_ID, date);
    }
  });

  it("marks the selected date's chip and no other chip", async () => {
    mockUsePredictions.mockReturnValue(successState("green"));
    await renderStrip({ selectedDate: DATES[2] });

    const pressed = screen.getAllByRole("button").filter((button) => button.props.accessibilityState?.selected);
    expect(pressed).toHaveLength(1);
    expect(pressed[0]).toHaveAccessibleName(/^Sat:/);
  });
});
