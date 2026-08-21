import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { User } from "firebase/auth";
import { useReportEligibility } from "./useReportEligibility";
import { fetchReportStatus } from "../data/fetchReportStatus";

jest.mock("../data/fetchReportStatus", () => ({
  fetchReportStatus: jest.fn(),
}));

// Forces the within-window branch deterministically — legalWindow.ts is exercised by its own
// tests; this suite only cares about what useReportEligibility does with the result.
jest.mock("../../utils/legalWindow", () => ({
  isOutsideLegalWindow: jest.fn(() => false),
}));

const BEACH_ID = "beach-a";
const VERIFIED_USER = { emailVerified: true } as User;

describe("useReportEligibility", () => {
  beforeEach(() => {
    jest.mocked(fetchReportStatus).mockReset();
  });

  it("reports checking while auth is still loading", async () => {
    const { result } = await renderHook(() => useReportEligibility(BEACH_ID, null, true));
    expect(result.current[0]).toEqual({ status: "checking" });
  });

  it("reports unauthenticated when there is no user", async () => {
    const { result } = await renderHook(() => useReportEligibility(BEACH_ID, null, false));
    expect(result.current[0]).toEqual({ status: "unauthenticated" });
  });

  it("reports ineligible when the signed-in user's email isn't verified", async () => {
    const { result } = await renderHook(() =>
      useReportEligibility(BEACH_ID, { emailVerified: false } as User, false),
    );
    expect(result.current[0]).toEqual({ status: "ineligible", reason: "Verify your email first" });
  });

  it("checks the server, then reports eligible once it resolves false", async () => {
    // A never-resolving promise keeps this observably "checking" — RNTL's `renderHook` is itself
    // async and already flushes pending microtasks, so a fetch mocked to resolve immediately (as
    // fetchReportStatus is in every other case below) would already have settled to "eligible" by
    // the time `result` comes back, unlike the DOM RTL/vitest equivalent this hook was ported from.
    jest.mocked(fetchReportStatus).mockReturnValue(new Promise(() => {}));
    const { result } = await renderHook(() => useReportEligibility(BEACH_ID, VERIFIED_USER, false));

    expect(result.current[0]).toEqual({ status: "checking" });
  });

  it("reports eligible once the server confirms nothing was reported today", async () => {
    jest.mocked(fetchReportStatus).mockResolvedValue({ alreadyReportedToday: false });
    const { result } = await renderHook(() => useReportEligibility(BEACH_ID, VERIFIED_USER, false));

    await waitFor(() => expect(result.current[0]).toEqual({ status: "eligible" }));
  });

  it("reports already-reported with the fetched flagColor and agreesWithPrediction once the server confirms it", async () => {
    jest.mocked(fetchReportStatus).mockResolvedValue({
      alreadyReportedToday: true,
      reported: { flagColor: "yellow", agreesWithPrediction: true },
    });
    const { result } = await renderHook(() => useReportEligibility(BEACH_ID, VERIFIED_USER, false));

    await waitFor(() =>
      expect(result.current[0]).toEqual({
        status: "already-reported",
        reported: { flagColor: "yellow", agreesWithPrediction: true },
      }),
    );
  });

  it("fails closed to ineligible when the status check rejects, rather than inviting a possibly-duplicate vote", async () => {
    jest.mocked(fetchReportStatus).mockRejectedValue(new Error("network down"));
    const { result } = await renderHook(() => useReportEligibility(BEACH_ID, VERIFIED_USER, false));

    await waitFor(() =>
      expect(result.current[0]).toEqual({ status: "ineligible", reason: "Could not check report status" }),
    );
  });

  it("markReportedToday optimistically flips to already-reported with the given color and agreement", async () => {
    jest.mocked(fetchReportStatus).mockResolvedValue({ alreadyReportedToday: false });
    const { result } = await renderHook(() => useReportEligibility(BEACH_ID, VERIFIED_USER, false));
    await waitFor(() => expect(result.current[0]).toEqual({ status: "eligible" }));

    await act(async () => result.current[1].markReportedToday({ flagColor: "red", agreesWithPrediction: false }));

    expect(result.current[0]).toEqual({
      status: "already-reported",
      reported: { flagColor: "red", agreesWithPrediction: false },
    });
  });

  it("refetch re-queries the server and updates eligibility with the color that actually won", async () => {
    jest.mocked(fetchReportStatus).mockResolvedValue({ alreadyReportedToday: false });
    const { result } = await renderHook(() => useReportEligibility(BEACH_ID, VERIFIED_USER, false));
    await waitFor(() => expect(result.current[0]).toEqual({ status: "eligible" }));

    jest.mocked(fetchReportStatus).mockResolvedValue({
      alreadyReportedToday: true,
      reported: { flagColor: "green", agreesWithPrediction: true },
    });
    await act(async () => result.current[1].refetch());

    expect(result.current[0]).toEqual({
      status: "already-reported",
      reported: { flagColor: "green", agreesWithPrediction: true },
    });
  });
});
