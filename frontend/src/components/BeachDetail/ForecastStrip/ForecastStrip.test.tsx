import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ForecastStrip } from "./ForecastStrip";
import type { PredictionsState } from "../hooks/usePredictions";
import type { HourlyPrediction } from "../interfaces";

const mockUsePredictions = vi.hoisted(() => vi.fn<(beachId: string, date?: string) => PredictionsState>());
vi.mock("../hooks/usePredictions", () => ({ usePredictions: mockUsePredictions }));

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
    updatedAt: "2026-08-13T00:00:00.000Z",
    refreshing: false,
    data: {
      beachId: BEACH_ID,
      date: TODAY,
      hourlyPredictions: [hour({ hour: 12, flagColor })],
    },
  };
}

beforeEach(() => {
  vi.setSystemTime(new Date("2026-08-13T10:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ForecastStrip", () => {
  it("renders exactly 7 chips: Today, then the next 6 calendar dates", () => {
    mockUsePredictions.mockReturnValue({ status: "loading" });
    render(<ForecastStrip beachId={BEACH_ID} />);

    expect(screen.getAllByRole("button")).toHaveLength(7);
    expect(screen.getByRole("button", { name: "Today: loading forecast" })).toBeInTheDocument();
    // 2026-08-14 is a Friday.
    expect(screen.getByRole("button", { name: "Fri: loading forecast" })).toBeInTheDocument();
  });

  it("gives each chip its own independent state — one failure doesn't affect the others", () => {
    mockUsePredictions.mockImplementation((_beachId, date) => {
      if (date === DATES[0]) return { status: "loading" };
      if (date === DATES[1]) return successState("red");
      if (date === DATES[2]) return { status: "error", message: "network down" };
      if (date === DATES[3]) return { status: "not-found" };
      return successState("green");
    });

    render(<ForecastStrip beachId={BEACH_ID} />);

    expect(screen.getByRole("button", { name: "Today: loading forecast" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Fri: Red flag · no swimming" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Sat: forecast unavailable" })).toBeDisabled();
    // Sun is not-found (outside the marine wave-data horizon, #87) — its chip renders nothing at
    // all, rather than a muted "unavailable" one, so it never shows up as a button.
    expect(screen.queryByRole("button", { name: "Sun: forecast unavailable" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Green flag/ })).toHaveLength(3);
    expect(screen.getAllByRole("button")).toHaveLength(6);
  });

  it("fetches each chip's day independently by beachId and date", () => {
    mockUsePredictions.mockReturnValue({ status: "loading" });
    render(<ForecastStrip beachId={BEACH_ID} />);

    for (const date of DATES) {
      expect(mockUsePredictions).toHaveBeenCalledWith(BEACH_ID, date);
    }
  });

  it("marks the selected date's chip via aria-pressed and no other chip", () => {
    mockUsePredictions.mockReturnValue(successState("green"));
    render(<ForecastStrip beachId={BEACH_ID} selectedDate={DATES[2]} />);

    const pressed = screen.getAllByRole("button").filter((button) => button.getAttribute("aria-pressed") === "true");
    expect(pressed).toHaveLength(1);
    expect(pressed[0]).toHaveAccessibleName(/^Sat:/);
  });
});
