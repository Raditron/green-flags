import { renderHook, waitFor } from "@testing-library/react-native";
import { usePredictions } from "./usePredictions";
import { fetchPredictions, PredictionsNotFoundError } from "../data/fetchPredictions";
import type { BeachDailyPredictions } from "../interfaces";

jest.mock("../data/fetchPredictions", () => {
  const actual = jest.requireActual("../data/fetchPredictions");
  return { ...actual, fetchPredictions: jest.fn() };
});

const BEACH_ID = "beach-a";

function predictions(date: string): BeachDailyPredictions {
  return { beachId: BEACH_ID, date, issuedDate: date, hourlyPredictions: [] };
}

describe("usePredictions", () => {
  beforeEach(() => {
    jest.mocked(fetchPredictions).mockReset();
  });

  it("starts in a loading state", async () => {
    jest.mocked(fetchPredictions).mockReturnValue(new Promise(() => {}));
    const { result } = await renderHook(() => usePredictions(BEACH_ID));

    expect(result.current.status).toBe("loading");
  });

  it("omits the date argument when none is given, preserving today's exact current request", async () => {
    jest.mocked(fetchPredictions).mockResolvedValue(predictions("2026-08-13"));
    const { result } = await renderHook(() => usePredictions(BEACH_ID));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(fetchPredictions).toHaveBeenCalledWith(BEACH_ID, undefined);
  });

  it("passes an explicit date straight through to fetchPredictions", async () => {
    jest.mocked(fetchPredictions).mockResolvedValue(predictions("2026-08-15"));
    const { result } = await renderHook(() => usePredictions(BEACH_ID, "2026-08-15"));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(fetchPredictions).toHaveBeenCalledWith(BEACH_ID, "2026-08-15");
    expect(result.current).toMatchObject({ data: { date: "2026-08-15" } });
  });

  it("surfaces a 404 as a distinct not-found state rather than a generic error", async () => {
    jest.mocked(fetchPredictions).mockRejectedValue(new PredictionsNotFoundError());
    const { result } = await renderHook(() => usePredictions(BEACH_ID, "2026-08-20"));

    await waitFor(() => expect(result.current.status).toBe("not-found"));
  });

  it("surfaces a genuine failure as error, distinct from not-found", async () => {
    jest.mocked(fetchPredictions).mockRejectedValue(new Error("network down"));
    const { result } = await renderHook(() => usePredictions(BEACH_ID, "2026-08-20"));

    await waitFor(() => expect(result.current).toEqual({ status: "error", message: "network down" }));
  });
});
