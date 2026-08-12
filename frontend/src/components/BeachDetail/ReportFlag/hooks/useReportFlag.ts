import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { useAuth } from "../../../../auth/AuthContext";
import { AUTO_DISMISS_MS } from "../../../Layout/Toast/Toast";
import { ReportSubmissionError, submitFlagReport } from "../data/submitFlagReport";
import { useReportEligibility } from "./useReportEligibility";
import type { ReportEligibility } from "./useReportEligibility";
import type { FlagColor } from "../../../../shared/types/Beach";

const ALREADY_REPORTED_CODE = "already_reported";

export type ReportSubmission =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

export interface ReportFlagState {
  eligibility: ReportEligibility;
  // Whether Verdict should render its inline flag picker at all — true for both an eligible
  // signed-in visitor and a signed-out one (picking a color for the latter routes to sign-in
  // first, see onPick, then auto-submits the remembered color once authenticated).
  canInvite: boolean;
  showReportedToday: boolean;
  authenticating: boolean;
  submission: ReportSubmission;
  onPick: (flagColor: FlagColor) => void;
  onAuthClose: () => void;
  onAuthenticated: () => void;
}

/**
 * Owns the whole "report the flag" feature end to end — auth, eligibility, and the submission
 * itself — so Timeline (and Verdict, one level down) can stay presentational and just render
 * whatever this returns. The picker is inline now (no modal): picking a color submits
 * immediately for a signed-in eligible visitor, or remembers the pick and opens the sign-in
 * modal for a signed-out one, auto-submitting once they're authenticated.
 *
 * `enabled` is the isUnguarded === false gate BeachDetail used to apply directly to the old
 * ReportFlagButton: pass false while that's still unknown (undefined) or true, and every flag
 * here stays inert rather than flashing the report flow on for a beach it doesn't apply to.
 */
export function useReportFlag(beachId: string, enabled: boolean): ReportFlagState {
  const { user, loading: authLoading } = useAuth();
  const [eligibility, { markReportedToday, refetch }] = useReportEligibility(beachId, user, authLoading);
  const [authenticating, setAuthenticating] = useState(false);
  const [pendingColor, setPendingColor] = useState<FlagColor | null>(null);
  const [submission, setSubmission] = useState<ReportSubmission>({ status: "idle" });

  const canInvite = enabled && !authLoading && (!user || eligibility.status === "eligible");
  const showReportedToday = enabled && eligibility.status === "already-reported";

  async function submit(currentUser: User, flagColor: FlagColor) {
    setSubmission({ status: "submitting" });
    try {
      const result = await submitFlagReport(beachId, currentUser, flagColor);
      markReportedToday({ flagColor, agreesWithPrediction: result.agreesWithPrediction });
      setSubmission({ status: "success" });
    } catch (error) {
      if (error instanceof ReportSubmissionError && error.code === ALREADY_REPORTED_CODE) {
        // Someone else's submission (or a duplicate from this user) won the race — refetch
        // rather than assume the color this client just attempted is the one that stuck.
        await refetch();
        setSubmission({ status: "idle" });
      } else {
        setSubmission({
          status: "error",
          message: error instanceof ReportSubmissionError ? error.message : "Could not submit report",
        });
      }
    }
  }

  function onPick(flagColor: FlagColor) {
    if (!user) {
      setPendingColor(flagColor);
      setAuthenticating(true);
      return;
    }
    void submit(user, flagColor);
  }

  function onAuthenticated() {
    setAuthenticating(false);
    // The auto-submit itself waits for `user` to actually reflect the new session (see the
    // effect below) rather than firing here, since Firebase's auth state listener updates
    // useAuth()'s user asynchronously and may not have caught up yet at this callback.
  }

  // Once a signed-out visitor finishes authenticating, auto-submits the color they picked
  // before being routed to sign in, rather than leaving them to click it a second time.
  useEffect(() => {
    if (!user || pendingColor === null) return;
    const flagColor = pendingColor;
    setPendingColor(null);
    void submit(user, flagColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the user itself changes, not on every submit/markReportedToday/refetch identity change
  }, [user]);

  // Gives a submission error a moment on screen, then clears back to idle so the inline
  // picker is retryable. Success doesn't need this: markReportedToday above already flips
  // eligibility to "already-reported" in the same update, so Timeline swaps straight to
  // ReportedTodayNotice without a transient "thanks" state to dismiss.
  useEffect(() => {
    if (submission.status !== "error") return;
    const timer = setTimeout(() => setSubmission({ status: "idle" }), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [submission]);

  return {
    eligibility,
    canInvite,
    showReportedToday,
    authenticating,
    submission,
    onPick,
    onAuthClose: () => {
      setAuthenticating(false);
      setPendingColor(null);
    },
    onAuthenticated,
  };
}
