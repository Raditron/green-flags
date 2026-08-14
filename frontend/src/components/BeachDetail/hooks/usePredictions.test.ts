import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePredictions } from "./usePredictions";
import { fetchPredictions, PredictionsNotFoundError } from "../data/fetchPredictions";
import type { BeachDailyPredictions } from "../interfaces";

vi.mock("../data/fetchPredictions", async () => {
  const actual = await vi.importActual<typeof import("../data/fetchPredictions")>("../data/fetchPredictions");
  return { ...actual, fetchPredictions: vi.fn() };
});

const BEACH_ID = "beach-a";

function predictions(date: string): BeachDailyPredictions {
  return { beachId: BEACH_ID, date, issuedDate: date, hourlyPredictions: [] };
}

describe("usePredictions", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(fetchPredictions).mockReset();
  });

  it("omits the date argument when none is given, preserving today's exact current request", async () => {
    vi.mocked(fetchPredictions).mockResolvedValue(predictions("2026-08-13"));
    const { result } = renderHook(() => usePredictions(BEACH_ID));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(fetchPredictions).toHaveBeenCalledWith(BEACH_ID, undefined);
  });

  it("passes an explicit date straight through to fetchPredictions", async () => {
    vi.mocked(fetchPredictions).mockResolvedValue(predictions("2026-08-15"));
    const { result } = renderHook(() => usePredictions(BEACH_ID, "2026-08-15"));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(fetchPredictions).toHaveBeenCalledWith(BEACH_ID, "2026-08-15");
  });

  it("caches two different dates for the same beach independently", async () => {
    vi.mocked(fetchPredictions).mockImplementation(async (_beachId, date) => predictions(date ?? "today"));

    const today = renderHook(() => usePredictions(BEACH_ID));
    await waitFor(() => expect(today.result.current.status).toBe("success"));

    const future = renderHook(() => usePredictions(BEACH_ID, "2026-08-20"));
    await waitFor(() => expect(future.result.current.status).toBe("success"));

    // Re-mounting each hook re-reads from cache synchronously (before the network call resolves),
    // and each still reports its own date rather than the other's.
    const todayAgain = renderHook(() => usePredictions(BEACH_ID));
    const futureAgain = renderHook(() => usePredictions(BEACH_ID, "2026-08-20"));
    expect(todayAgain.result.current).toMatchObject({ status: "success", data: { date: "today" } });
    expect(futureAgain.result.current).toMatchObject({ status: "success", data: { date: "2026-08-20" } });
  });

  it("ignores a stale pre-bump cache entry instead of misreading it", () => {
    localStorage.setItem(
      "green-flags:predictions:beach-a:today",
      JSON.stringify({ version: 1, data: predictions("2026-08-13"), updatedAt: "2026-08-13T00:00:00.000Z" }),
    );
    vi.mocked(fetchPredictions).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePredictions(BEACH_ID));
    expect(result.current.status).toBe("loading");
  });

  it("surfaces a 404 as a distinct not-found state rather than a generic error", async () => {
    vi.mocked(fetchPredictions).mockRejectedValue(new PredictionsNotFoundError());
    const { result } = renderHook(() => usePredictions(BEACH_ID, "2026-08-20"));

    await waitFor(() => expect(result.current.status).toBe("not-found"));
  });

  it("surfaces a genuine failure as error, distinct from not-found", async () => {
    vi.mocked(fetchPredictions).mockRejectedValue(new Error("network down"));
    const { result } = renderHook(() => usePredictions(BEACH_ID, "2026-08-20"));

    await waitFor(() =>
      expect(result.current).toEqual({ status: "error", message: "network down" }),
    );
  });
});
