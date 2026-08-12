import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";
import { useReportFlag } from "./useReportFlag";
import { fetchReportStatus } from "../data/fetchReportStatus";
import { ReportSubmissionError, submitFlagReport } from "../data/submitFlagReport";

vi.mock("../data/fetchReportStatus", () => ({
  fetchReportStatus: vi.fn(),
}));

vi.mock("../data/submitFlagReport", async () => {
  const actual = await vi.importActual<typeof import("../data/submitFlagReport")>("../data/submitFlagReport");
  return { ...actual, submitFlagReport: vi.fn() };
});

vi.mock("../../utils/legalWindow", () => ({
  isOutsideLegalWindow: vi.fn(() => false),
}));

const mockAuthState: { user: User | null; loading: boolean } = { user: null, loading: false };
vi.mock("../../../../auth/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));

const BEACH_ID = "beach-a";
const VERIFIED_USER = { uid: "u1", emailVerified: true } as User;

describe("useReportFlag", () => {
  beforeEach(() => {
    mockAuthState.user = null;
    mockAuthState.loading = false;
    vi.mocked(fetchReportStatus).mockReset().mockResolvedValue({ alreadyReportedToday: false });
    vi.mocked(submitFlagReport).mockReset();
    vi.useRealTimers();
  });

  it("submits immediately for a signed-in eligible visitor and flips to already-reported", async () => {
    mockAuthState.user = VERIFIED_USER;
    vi.mocked(submitFlagReport).mockResolvedValue({ agreesWithPrediction: true });

    const { result } = renderHook(() => useReportFlag(BEACH_ID, true));
    await waitFor(() => expect(result.current.canInvite).toBe(true));

    act(() => result.current.onPick("green"));

    expect(submitFlagReport).toHaveBeenCalledWith(BEACH_ID, VERIFIED_USER, "green");
    await waitFor(() => expect(result.current.showReportedToday).toBe(true));
    expect(result.current.eligibility).toEqual({
      status: "already-reported",
      reported: { flagColor: "green", agreesWithPrediction: true },
    });
    expect(result.current.canInvite).toBe(false);
  });

  it("remembers the picked color and opens sign-in for a signed-out visitor, without submitting yet", async () => {
    const { result } = renderHook(() => useReportFlag(BEACH_ID, true));
    await waitFor(() => expect(result.current.canInvite).toBe(true));

    act(() => result.current.onPick("red"));

    expect(result.current.authenticating).toBe(true);
    expect(submitFlagReport).not.toHaveBeenCalled();
  });

  it("auto-submits the remembered color once the visitor finishes authenticating", async () => {
    vi.mocked(submitFlagReport).mockResolvedValue({ agreesWithPrediction: false });
    const { result, rerender } = renderHook(() => useReportFlag(BEACH_ID, true));
    await waitFor(() => expect(result.current.canInvite).toBe(true));

    act(() => result.current.onPick("yellow"));
    act(() => result.current.onAuthenticated());
    expect(submitFlagReport).not.toHaveBeenCalled();

    // Firebase's auth listener resolves asynchronously — useAuth()'s user only reflects the
    // new session on a subsequent render, which is what the auto-submit effect waits for.
    mockAuthState.user = VERIFIED_USER;
    rerender();

    await waitFor(() => expect(submitFlagReport).toHaveBeenCalledWith(BEACH_ID, VERIFIED_USER, "yellow"));
    await waitFor(() => expect(result.current.showReportedToday).toBe(true));
  });

  it("forgets the remembered color if the visitor cancels sign-in", async () => {
    const { result, rerender } = renderHook(() => useReportFlag(BEACH_ID, true));
    await waitFor(() => expect(result.current.canInvite).toBe(true));

    act(() => result.current.onPick("green"));
    act(() => result.current.onAuthClose());
    expect(result.current.authenticating).toBe(false);

    mockAuthState.user = VERIFIED_USER;
    rerender();

    await waitFor(() => expect(result.current.canInvite).toBe(true));
    expect(submitFlagReport).not.toHaveBeenCalled();
  });

  it("refetches report status instead of trusting the local color when a duplicate-submission race is lost", async () => {
    mockAuthState.user = VERIFIED_USER;
    vi.mocked(submitFlagReport).mockRejectedValue(new ReportSubmissionError("already_reported", "Already reported today"));
    const { result } = renderHook(() => useReportFlag(BEACH_ID, true));
    await waitFor(() => expect(result.current.canInvite).toBe(true));

    // The color that actually won the race, per a fresh server read.
    vi.mocked(fetchReportStatus).mockResolvedValue({
      alreadyReportedToday: true,
      reported: { flagColor: "red", agreesWithPrediction: false },
    });

    act(() => result.current.onPick("green"));

    await waitFor(() =>
      expect(result.current.eligibility).toEqual({
        status: "already-reported",
        reported: { flagColor: "red", agreesWithPrediction: false },
      }),
    );
    expect(result.current.submission).toEqual({ status: "idle" });
  });

  it("shows a submission error, then reverts to idle after the auto-dismiss delay", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockAuthState.user = VERIFIED_USER;
    vi.mocked(submitFlagReport).mockRejectedValue(new ReportSubmissionError("unknown_error", "Could not submit report"));
    const { result } = renderHook(() => useReportFlag(BEACH_ID, true));
    await waitFor(() => expect(result.current.canInvite).toBe(true));

    await act(async () => {
      result.current.onPick("green");
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.submission).toEqual({ status: "error", message: "Could not submit report" });

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.submission).toEqual({ status: "idle" });
    vi.useRealTimers();
  });
});
