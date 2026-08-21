import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { User } from "firebase/auth";
import { useReportFlag } from "./useReportFlag";
import { fetchReportStatus } from "../data/fetchReportStatus";
import { ReportSubmissionError, submitFlagReport } from "../data/submitFlagReport";
import { AUTO_DISMISS_MS } from "../../../../toast/Toast";

jest.mock("../data/fetchReportStatus", () => ({
  fetchReportStatus: jest.fn(),
}));

jest.mock("../data/submitFlagReport", () => {
  const actual = jest.requireActual("../data/submitFlagReport");
  return { ...actual, submitFlagReport: jest.fn() };
});

jest.mock("../../utils/legalWindow", () => ({
  isOutsideLegalWindow: jest.fn(() => false),
}));

const mockAuthState: { user: User | null; loading: boolean } = { user: null, loading: false };
jest.mock("../../../../auth/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));

const BEACH_ID = "beach-a";
const VERIFIED_USER = { uid: "u1", emailVerified: true } as User;

// onPick fires its submission (submitFlagReport → markReportedToday/setSubmission) as an
// un-awaited `void submit(...)` chain, so a plain `act(() => onPick(...))` returns before that
// chain's microtasks run — RNTL's stricter act-environment then drops the resulting state
// updates instead of picking them up on a later waitFor() poll, unlike the DOM RTL/vitest
// equivalent this hook was ported from. Staying inside `act` for a few extra microtask ticks
// gives the chain (one await for submitFlagReport, then its synchronous follow-up setState
// calls) room to finish inside the tracked scope.
async function pickAndFlush(result: { current: ReturnType<typeof useReportFlag> }, flagColor: "green" | "yellow" | "red") {
  await act(async () => {
    result.current.onPick(flagColor);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("useReportFlag", () => {
  beforeEach(() => {
    mockAuthState.user = null;
    mockAuthState.loading = false;
    jest.mocked(fetchReportStatus).mockReset().mockResolvedValue({ alreadyReportedToday: false });
    jest.mocked(submitFlagReport).mockReset();
    jest.useRealTimers();
  });

  it("submits immediately for a signed-in eligible visitor and flips to already-reported", async () => {
    mockAuthState.user = VERIFIED_USER;
    jest.mocked(submitFlagReport).mockResolvedValue({ agreesWithPrediction: true });

    const { result } = await renderHook(() => useReportFlag(BEACH_ID, true));
    await waitFor(() => expect(result.current.canInvite).toBe(true));

    await pickAndFlush(result, "green");

    expect(submitFlagReport).toHaveBeenCalledWith(BEACH_ID, VERIFIED_USER, "green");
    await waitFor(() => expect(result.current.showReportedToday).toBe(true));
    expect(result.current.eligibility).toEqual({
      status: "already-reported",
      reported: { flagColor: "green", agreesWithPrediction: true },
    });
    expect(result.current.canInvite).toBe(false);
  });

  it("remembers the picked color and opens sign-in for a signed-out visitor, without submitting yet", async () => {
    const { result } = await renderHook(() => useReportFlag(BEACH_ID, true));
    await waitFor(() => expect(result.current.canInvite).toBe(true));

    await act(async () => result.current.onPick("red"));

    expect(result.current.authenticating).toBe(true);
    expect(submitFlagReport).not.toHaveBeenCalled();
  });

  it("auto-submits the remembered color once the visitor finishes authenticating", async () => {
    jest.mocked(submitFlagReport).mockResolvedValue({ agreesWithPrediction: false });
    const { result, rerender } = await renderHook(() => useReportFlag(BEACH_ID, true));
    await waitFor(() => expect(result.current.canInvite).toBe(true));

    await act(async () => result.current.onPick("yellow"));
    await act(async () => result.current.onAuthenticated());
    expect(submitFlagReport).not.toHaveBeenCalled();

    // Firebase's auth listener resolves asynchronously — useAuth()'s user only reflects the
    // new session on a subsequent render, which is what the auto-submit effect waits for.
    mockAuthState.user = VERIFIED_USER;
    await act(async () => rerender(undefined));

    await waitFor(() => expect(submitFlagReport).toHaveBeenCalledWith(BEACH_ID, VERIFIED_USER, "yellow"));
    await waitFor(() => expect(result.current.showReportedToday).toBe(true));
  });

  it("forgets the remembered color if the visitor cancels sign-in", async () => {
    const { result, rerender } = await renderHook(() => useReportFlag(BEACH_ID, true));
    await waitFor(() => expect(result.current.canInvite).toBe(true));

    await act(async () => result.current.onPick("green"));
    await act(async () => result.current.onAuthClose());
    expect(result.current.authenticating).toBe(false);

    mockAuthState.user = VERIFIED_USER;
    await act(async () => rerender(undefined));

    await waitFor(() => expect(result.current.canInvite).toBe(true));
    expect(submitFlagReport).not.toHaveBeenCalled();
  });

  it("refetches report status instead of trusting the local color when a duplicate-submission race is lost", async () => {
    mockAuthState.user = VERIFIED_USER;
    jest
      .mocked(submitFlagReport)
      .mockRejectedValue(new ReportSubmissionError("already_reported", "Already reported today"));
    const { result } = await renderHook(() => useReportFlag(BEACH_ID, true));
    await waitFor(() => expect(result.current.canInvite).toBe(true));

    // The color that actually won the race, per a fresh server read.
    jest.mocked(fetchReportStatus).mockResolvedValue({
      alreadyReportedToday: true,
      reported: { flagColor: "red", agreesWithPrediction: false },
    });

    await pickAndFlush(result, "green");

    await waitFor(() =>
      expect(result.current.eligibility).toEqual({
        status: "already-reported",
        reported: { flagColor: "red", agreesWithPrediction: false },
      }),
    );
    expect(result.current.submission).toEqual({ status: "idle" });
  });

  it("shows a submission error, then reverts to idle after the auto-dismiss delay", async () => {
    mockAuthState.user = VERIFIED_USER;
    jest
      .mocked(submitFlagReport)
      .mockRejectedValue(new ReportSubmissionError("unknown_error", "Could not submit report"));
    const { result } = await renderHook(() => useReportFlag(BEACH_ID, true));
    await waitFor(() => expect(result.current.canInvite).toBe(true));

    // Fake timers from here on, so the error effect's setTimeout(..., AUTO_DISMISS_MS) is one
    // advanceTimersByTime can actually reach — starting fake timers only after the submission
    // (as the auto-dismiss delay's own real setTimeout would otherwise ignore it, same as a
    // stray real timer left running past the end of the test) doesn't affect the promise
    // microtasks pickAndFlush awaits, which fake timers leave alone.
    jest.useFakeTimers();

    await pickAndFlush(result, "green");

    expect(result.current.submission).toEqual({ status: "error", message: "Could not submit report" });

    await act(async () => {
      jest.advanceTimersByTime(AUTO_DISMISS_MS);
    });

    expect(result.current.submission).toEqual({ status: "idle" });
    jest.useRealTimers();
  });
});
