import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ForecastStripChip } from "./ForecastStripChip";
import type { PredictionsState } from "../../hooks/usePredictions";
import type { HourlyPrediction } from "../../interfaces";

const mockUsePredictions = vi.hoisted(() => vi.fn<() => PredictionsState>());
vi.mock("../../hooks/usePredictions", () => ({ usePredictions: mockUsePredictions }));

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

function renderChip(overrides: Partial<{ selected: boolean; onSelect: (date: string) => void }> = {}) {
  const onSelect = overrides.onSelect ?? vi.fn();
  render(
    <ForecastStripChip
      beachId={BEACH_ID}
      date={DATE}
      label="Thu"
      selected={overrides.selected ?? false}
      onSelect={onSelect}
    />,
  );
  return { onSelect };
}

describe("ForecastStripChip", () => {
  it("shows a pending look while loading", () => {
    mockUsePredictions.mockReturnValue({ status: "loading" });
    renderChip();

    const button = screen.getByRole("button", { name: "Thu: loading forecast" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).not.toBeDisabled();
  });

  it("shows a resolved look with the worst-case flag color once data arrives", () => {
    mockUsePredictions.mockReturnValue({
      status: "success",
      updatedAt: "2026-08-20T00:00:00.000Z",
      refreshing: false,
      data: {
        beachId: BEACH_ID,
        date: DATE,
        issuedDate: "2026-08-14",
        hourlyPredictions: [hour({ hour: 9, flagColor: "green" }), hour({ hour: 15, flagColor: "red" })],
      },
    });
    renderChip();

    const button = screen.getByRole("button", { name: "Thu: Red flag · no swimming" });
    expect(button).toHaveAttribute("aria-busy", "false");
    expect(button).not.toBeDisabled();
  });

  it("shows a muted, disabled look on a fetch error", () => {
    mockUsePredictions.mockReturnValue({ status: "error", message: "network down" });
    renderChip();

    const button = screen.getByRole("button", { name: "Thu: forecast unavailable" });
    expect(button).toBeDisabled();
  });

  it("shows the same muted, disabled look on a 404 (not-found)", () => {
    mockUsePredictions.mockReturnValue({ status: "not-found" });
    renderChip();

    expect(screen.getByRole("button", { name: "Thu: forecast unavailable" })).toBeDisabled();
  });

  it("reflects selected state via aria-pressed", () => {
    mockUsePredictions.mockReturnValue({ status: "loading" });
    renderChip({ selected: true });

    expect(screen.getByRole("button", { name: "Thu: loading forecast" })).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onSelect with its own date when clicked", async () => {
    mockUsePredictions.mockReturnValue({
      status: "success",
      updatedAt: "2026-08-20T00:00:00.000Z",
      refreshing: false,
      data: {
        beachId: BEACH_ID,
        date: DATE,
        issuedDate: "2026-08-14",
        hourlyPredictions: [hour({ hour: 12, flagColor: "yellow" })],
      },
    });
    const user = userEvent.setup();
    const { onSelect } = renderChip();

    await user.click(screen.getByRole("button", { name: "Thu: Yellow flag · caution advised" }));

    expect(onSelect).toHaveBeenCalledWith(DATE);
  });
});
