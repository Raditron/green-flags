import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";
import { useReportEligibility } from "./useReportEligibility";
import { fetchReportStatus } from "../data/fetchReportStatus";

vi.mock("../data/fetchReportStatus", () => ({
  fetchReportStatus: vi.fn(),
}));

// Forces the within-window branch deterministically — legalWindow.ts is exercised by its own
// tests; this suite only cares about what useReportEligibility does with the result.
vi.mock("../../utils/legalWindow", () => ({
  isOutsideLegalWindow: vi.fn(() => false),
}));

const BEACH_ID = "beach-a";
const VERIFIED_USER = { emailVerified: true } as User;

describe("useReportEligibility", () => {
  beforeEach(() => {
    vi.mocked(fetchReportStatus).mockReset();
  });

  it("reports checking while auth is still loading", () => {
    const { result } = renderHook(() => useReportEligibility(BEACH_ID, null, true));
    expect(result.current[0]).toEqual({ status: "checking" });
  });

  it("reports unauthenticated when there is no user", () => {
    const { result } = renderHook(() => useReportEligibility(BEACH_ID, null, false));
    expect(result.current[0]).toEqual({ status: "unauthenticated" });
  });

  it("reports ineligible when the signed-in user's email isn't verified", () => {
    const { result } = renderHook(() => useReportEligibility(BEACH_ID, { emailVerified: false } as User, false));
    expect(result.current[0]).toEqual({ status: "ineligible", reason: "Verify your email first" });
  });

  it("checks the server, then reports eligible once it resolves false", async () => {
    vi.mocked(fetchReportStatus).mockResolvedValue({ alreadyReportedToday: false });
    const { result } = renderHook(() => useReportEligibility(BEACH_ID, VERIFIED_USER, false));

    expect(result.current[0]).toEqual({ status: "checking" });
    await waitFor(() => expect(result.current[0]).toEqual({ status: "eligible" }));
  });

  it("reports already-reported with the fetched flagColor and agreesWithPrediction once the server confirms it", async () => {
    vi.mocked(fetchReportStatus).mockResolvedValue({
      alreadyReportedToday: true,
      reported: { flagColor: "yellow", agreesWithPrediction: true },
    });
    const { result } = renderHook(() => useReportEligibility(BEACH_ID, VERIFIED_USER, false));

    await waitFor(() =>
      expect(result.current[0]).toEqual({
        status: "already-reported",
        reported: { flagColor: "yellow", agreesWithPrediction: true },
      }),
    );
  });

  it("fails closed to ineligible when the status check rejects, rather than inviting a possibly-duplicate vote", async () => {
    vi.mocked(fetchReportStatus).mockRejectedValue(new Error("network down"));
    const { result } = renderHook(() => useReportEligibility(BEACH_ID, VERIFIED_USER, false));

    await waitFor(() =>
      expect(result.current[0]).toEqual({ status: "ineligible", reason: "Could not check report status" }),
    );
  });

  it("markReportedToday optimistically flips to already-reported with the given color and agreement", async () => {
    vi.mocked(fetchReportStatus).mockResolvedValue({ alreadyReportedToday: false });
    const { result } = renderHook(() => useReportEligibility(BEACH_ID, VERIFIED_USER, false));
    await waitFor(() => expect(result.current[0]).toEqual({ status: "eligible" }));

    act(() => result.current[1].markReportedToday({ flagColor: "red", agreesWithPrediction: false }));

    expect(result.current[0]).toEqual({
      status: "already-reported",
      reported: { flagColor: "red", agreesWithPrediction: false },
    });
  });

  it("refetch re-queries the server and updates eligibility with the color that actually won", async () => {
    vi.mocked(fetchReportStatus).mockResolvedValue({ alreadyReportedToday: false });
    const { result } = renderHook(() => useReportEligibility(BEACH_ID, VERIFIED_USER, false));
    await waitFor(() => expect(result.current[0]).toEqual({ status: "eligible" }));

    vi.mocked(fetchReportStatus).mockResolvedValue({
      alreadyReportedToday: true,
      reported: { flagColor: "green", agreesWithPrediction: true },
    });
    await act(() => result.current[1].refetch());

    expect(result.current[0]).toEqual({
      status: "already-reported",
      reported: { flagColor: "green", agreesWithPrediction: true },
    });
  });
});
