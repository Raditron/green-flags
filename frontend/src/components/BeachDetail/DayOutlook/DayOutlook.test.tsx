import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DayOutlook } from "./DayOutlook";
import type { PredictionsState } from "../hooks/usePredictions";
import type { HourlyPrediction } from "../interfaces";

const mockUsePredictions = vi.hoisted(() => vi.fn<() => PredictionsState>());
vi.mock("../hooks/usePredictions", () => ({ usePredictions: mockUsePredictions }));

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
  return render(<DayOutlook beachId={BEACH_ID} date={DATE} isUnguarded={isUnguarded} />);
}

describe("DayOutlook", () => {
  it("renders the worst-case hour's flag color, conditions sentence, caution, and hour mention", () => {
    mockUsePredictions.mockReturnValue({
      status: "success",
      updatedAt: "2026-08-20T00:00:00.000Z",
      refreshing: false,
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

    renderOutlook();

    expect(screen.getByText(/Red flag/)).toBeInTheDocument();
    expect(screen.getByText("Worst around 15:00")).toBeInTheDocument();
    expect(screen.getByText("Strong rip currents — stay close to shore")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Confidence" })).toHaveAttribute("aria-valuenow", "90");
    expect(screen.getByText("Wind: calm")).toBeInTheDocument();
    expect(screen.getByText("Sea: calm")).toBeInTheDocument();
  });

  it("renders UnguardedNotice when the beach is unguarded", () => {
    mockUsePredictions.mockReturnValue({
      status: "success",
      updatedAt: "2026-08-20T00:00:00.000Z",
      refreshing: false,
      data: {
        beachId: BEACH_ID,
        date: DATE,
        issuedDate: "2026-08-14",
        hourlyPredictions: [hour({ hour: 12 })],
      },
    });

    renderOutlook(true);

    expect(screen.getByText("Caution: unguarded beach")).toBeInTheDocument();
  });

  it("does not render TimePicker, a live clock, or the report-a-flag flow", () => {
    mockUsePredictions.mockReturnValue({
      status: "success",
      updatedAt: "2026-08-20T00:00:00.000Z",
      refreshing: false,
      data: {
        beachId: BEACH_ID,
        date: DATE,
        issuedDate: "2026-08-14",
        hourlyPredictions: [hour({ hour: 12 })],
      },
    });

    renderOutlook();

    expect(screen.queryByLabelText("Choose prediction hour")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("What color is the flag right now?")).not.toBeInTheDocument();
  });

  it("renders a distinct message while loading", () => {
    mockUsePredictions.mockReturnValue({ status: "loading" });
    renderOutlook();
    expect(screen.getByText("Loading forecast…")).toBeInTheDocument();
  });

  it("renders a distinct 'no forecast yet' message on not-found (404)", () => {
    mockUsePredictions.mockReturnValue({ status: "not-found" });
    renderOutlook();
    expect(screen.getByText("No forecast yet for this day")).toBeInTheDocument();
  });

  it("renders a distinct 'couldn't load' message on a genuine fetch failure", () => {
    mockUsePredictions.mockReturnValue({ status: "error", message: "network down" });
    renderOutlook();
    expect(screen.getByText("Couldn't load this day: network down")).toBeInTheDocument();
    expect(screen.queryByText("No forecast yet for this day")).not.toBeInTheDocument();
  });
});
