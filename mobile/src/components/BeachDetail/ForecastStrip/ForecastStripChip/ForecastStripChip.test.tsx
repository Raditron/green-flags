import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { ForecastStripChip } from "./ForecastStripChip";
import type { PredictionsState } from "../../hooks/usePredictions";
import type { HourlyPrediction } from "../../interfaces";

const mockUsePredictions = jest.fn<PredictionsState, [string, string?]>();
jest.mock("../../hooks/usePredictions", () => ({
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

async function renderChip(overrides: Partial<{ selected: boolean; onSelect: (date: string) => void }> = {}) {
  const onSelect = overrides.onSelect ?? jest.fn();
  const result = await render(
    <ThemeProvider>
      <ForecastStripChip
        beachId={BEACH_ID}
        date={DATE}
        label="Thu"
        selected={overrides.selected ?? false}
        onSelect={onSelect}
        itemStyle={{}}
      />
    </ThemeProvider>,
  );
  return { ...result, onSelect };
}

describe("ForecastStripChip", () => {
  beforeEach(() => {
    mockUsePredictions.mockReset();
  });

  it("shows a pending look while loading", async () => {
    mockUsePredictions.mockReturnValue({ status: "loading" });
    await renderChip();

    const button = screen.getByRole("button", { name: "Thu: loading forecast" });
    expect(button).toBeBusy();
    expect(button).not.toBeDisabled();
  });

  it("shows a resolved look with the worst-case flag color once data arrives", async () => {
    mockUsePredictions.mockReturnValue({
      status: "success",
      data: {
        beachId: BEACH_ID,
        date: DATE,
        issuedDate: "2026-08-14",
        hourlyPredictions: [hour({ hour: 9, flagColor: "green" }), hour({ hour: 15, flagColor: "red" })],
      },
    });
    await renderChip();

    const button = screen.getByRole("button", { name: "Thu: Red flag · no swimming" });
    expect(button).not.toBeBusy();
    expect(button).not.toBeDisabled();
  });

  it("shows a muted, disabled look on a fetch error", async () => {
    mockUsePredictions.mockReturnValue({ status: "error", message: "network down" });
    await renderChip();

    expect(screen.getByRole("button", { name: "Thu: forecast unavailable" })).toBeDisabled();
  });

  it("renders nothing on a 404 (not-found) — the day is outside the forecast horizon", async () => {
    mockUsePredictions.mockReturnValue({ status: "not-found" });
    const { toJSON } = await renderChip();

    expect(toJSON()).toBeNull();
  });

  it("reflects selected state via accessibilityState.selected", async () => {
    mockUsePredictions.mockReturnValue({ status: "loading" });
    await renderChip({ selected: true });

    expect(screen.getByRole("button", { name: "Thu: loading forecast" })).toBeSelected();
  });

  it("calls onSelect with its own date when pressed", async () => {
    mockUsePredictions.mockReturnValue({
      status: "success",
      data: {
        beachId: BEACH_ID,
        date: DATE,
        issuedDate: "2026-08-14",
        hourlyPredictions: [hour({ hour: 12, flagColor: "yellow" })],
      },
    });
    const { onSelect } = await renderChip();

    fireEvent.press(screen.getByRole("button", { name: "Thu: Yellow flag · caution advised" }));

    expect(onSelect).toHaveBeenCalledWith(DATE);
  });
});
