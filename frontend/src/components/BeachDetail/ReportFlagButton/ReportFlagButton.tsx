import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { AuthModal } from "../../Auth/AuthModal/AuthModal";
import { useToast } from "../../Layout/Toast/ToastContext";
import { AUTO_DISMISS_MS } from "../../Layout/Toast/Toast";
import { useReportEligibility } from "./hooks/useReportEligibility";
import { ReportSubmissionError, submitFlagReport } from "./data/submitFlagReport";
import { ReportPrompt } from "./ReportPrompt/ReportPrompt";
import { SignInPrompt } from "./SignInPrompt/SignInPrompt";
import type { FlagColor } from "../../../shared/types/Beach";
import { getReportFlagButtonStyles } from "./styles/ReportFlagButton.styles";

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; agreesWithPrediction: boolean }
  | { status: "error"; message: string };

const ALREADY_REPORTED_CODE = "already_reported";

/**
 * Renders no visible UI of its own (besides the sign-in modal, an existing full-screen flow).
 * The "report the flag" opportunity is driven entirely through a single toast instance — see
 * ToastContext — whose content this component swaps in place as auth/eligibility/submission
 * state changes: a sign-in prompt for guests, a color picker for eligible signed-in users, then
 * a confirmation/error message once a submission resolves.
 */
export function ReportFlagButton({ beachId }: { beachId: string }) {
  const { user, loading: authLoading } = useAuth();
  const [eligibility, markReportedToday] = useReportEligibility(beachId, user, authLoading);
  const [authenticating, setAuthenticating] = useState(false);
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });
  const { show: showToast, update: updateToast, dismiss: dismissToast } = useToast();
  const toastIdRef = useRef<number | null>(null);
  const styles = getReportFlagButtonStyles();

  async function handlePick(flagColor: FlagColor) {
    if (!user) return;
    setSubmission({ status: "submitting" });
    try {
      const result = await submitFlagReport(beachId, user, flagColor);
      markReportedToday();
      setSubmission({ status: "success", agreesWithPrediction: result.agreesWithPrediction });
    } catch (error) {
      if (error instanceof ReportSubmissionError && error.code === ALREADY_REPORTED_CODE) {
        markReportedToday();
        setSubmission({ status: "idle" });
      } else {
        setSubmission({
          status: "error",
          message: error instanceof ReportSubmissionError ? error.message : "Could not submit report",
        });
      }
    }
  }

  // Owns the toast for as long as there's a prompt to show: creates it once content becomes
  // available, updates the same instance in place as state changes, and removes it once
  // there's nothing left to say. Steps aside while a submission result is being shown — the
  // effect below owns the toast for that part of the flow instead.
  useEffect(() => {
    if (submission.status === "success" || submission.status === "error") return;

    let content: ReactNode = null;
    if (!user) {
      if (!authLoading) content = <SignInPrompt onSignIn={() => setAuthenticating(true)} />;
    } else if (eligibility.status === "eligible") {
      content = <ReportPrompt submitting={submission.status === "submitting"} onPick={handlePick} />;
    }

    if (content === null) {
      if (toastIdRef.current !== null) {
        dismissToast(toastIdRef.current);
        toastIdRef.current = null;
      }
      return;
    }

    if (toastIdRef.current === null) {
      toastIdRef.current = showToast(content, { autoDismiss: false });
    } else {
      updateToast(toastIdRef.current, content, { autoDismiss: false });
    }
    // handlePick/showToast/updateToast/dismissToast are effectively stable for this effect's
    // purposes — only the state actually driving toast content should re-run it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, eligibility.status, submission.status]);

  // Swaps the same toast to a confirmation/error message once a submission resolves, then
  // resets submission back to idle after the same delay the toast auto-dismisses on. That lets
  // the effect above pick the picker back up after an error (still eligible — nothing was ever
  // recorded), or show nothing after a success (now ineligible for the rest of today).
  useEffect(() => {
    if (submission.status !== "success" && submission.status !== "error") return;

    if (toastIdRef.current !== null) {
      const content =
        submission.status === "success" ? (
          <p style={styles.confirmation}>
            Thanks!{" "}
            {submission.agreesWithPrediction
              ? "That matches our prediction."
              : "Noted — that's different from our prediction."}
          </p>
        ) : (
          <p style={styles.error}>{submission.message}</p>
        );
      updateToast(toastIdRef.current, content, { autoDismiss: true });
      toastIdRef.current = null;
    }

    const timer = setTimeout(() => setSubmission({ status: "idle" }), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

  // If this beach's page is left with the toast still up (e.g. navigating to a different
  // beach), take it down rather than leaving a stale prompt on screen that would report
  // against a beach the visitor already navigated away from.
  useEffect(() => {
    return () => {
      if (toastIdRef.current !== null) dismissToast(toastIdRef.current);
    };
  }, [dismissToast]);

  return authenticating ? (
    <AuthModal onClose={() => setAuthenticating(false)} onAuthenticated={() => setAuthenticating(false)} />
  ) : null;
}
