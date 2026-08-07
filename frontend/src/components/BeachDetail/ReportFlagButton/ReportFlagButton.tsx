import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { AuthModal } from "../../Auth/AuthModal/AuthModal";
import { useReportEligibility } from "./hooks/useReportEligibility";
import { ReportSubmissionError, submitFlagReport } from "./data/submitFlagReport";
import { FlagColorPicker } from "./FlagColorPicker/FlagColorPicker";
import type { FlagColor } from "../interfaces";
import { getReportFlagButtonStyles } from "./styles/ReportFlagButton.styles";

type Flow =
  | { step: "closed" }
  | { step: "authenticating" }
  | { step: "resolvingEligibility" }
  | { step: "picking" };

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; agreesWithPrediction: boolean }
  | { status: "error"; message: string };

const ALREADY_REPORTED_CODE = "already_reported";

export function ReportFlagButton({
  beachId,
  autoOpen = false,
}: {
  beachId: string;
  // Set when arriving from the "Report" action on a beach card, to jump
  // straight into the flow instead of making the visitor click again.
  autoOpen?: boolean;
}) {
  const { user, loading: authLoading } = useAuth();
  const [eligibility, markReportedToday] = useReportEligibility(beachId, user, authLoading);
  const [flow, setFlow] = useState<Flow>({ step: "closed" });
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });
  const autoOpenTriggered = useRef(false);

  // After a successful sign-in/sign-up, the same eligibility rules apply as for an
  // already-authenticated user — wait for eligibility to finish resolving (it may still be
  // checking today's report-status) before deciding whether to open the picker or bail out.
  useEffect(() => {
    if (flow.step !== "resolvingEligibility" || !user || eligibility.status === "checking") {
      return;
    }
    setFlow(eligibility.status === "eligible" ? { step: "picking" } : { step: "closed" });
  }, [flow.step, user, eligibility.status]);

  const handleButtonClick = useCallback(() => {
    if (!user) {
      setFlow({ step: "authenticating" });
      return;
    }
    if (eligibility.status === "eligible") {
      setSubmission({ status: "idle" });
      setFlow({ step: "picking" });
    }
  }, [user, eligibility.status]);

  // Fires once, as soon as auth/eligibility have settled enough to know whether to open
  // the auth modal or the picker directly — never again after that, so dismissing either
  // one doesn't cause it to keep popping back up.
  useEffect(() => {
    if (!autoOpen || autoOpenTriggered.current) return;
    if (authLoading || eligibility.status === "checking") return;
    autoOpenTriggered.current = true;
    handleButtonClick();
  }, [autoOpen, authLoading, eligibility.status, handleButtonClick]);

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
    } finally {
      setFlow({ step: "closed" });
    }
  }

  const disabled = eligibility.status === "ineligible" || eligibility.status === "checking";
  const styles = getReportFlagButtonStyles({ disabled });

  return (
    <div style={styles.container}>
      <button type="button" style={styles.button} disabled={disabled} onClick={handleButtonClick}>
        Report the flag
      </button>

      {eligibility.status === "ineligible" && <p style={styles.reason}>{eligibility.reason}</p>}
      {submission.status === "success" && (
        <p style={styles.confirmation}>
          Thanks!{" "}
          {submission.agreesWithPrediction ? "That matches our prediction." : "Noted — that's different from our prediction."}
        </p>
      )}
      {submission.status === "error" && <p style={styles.error}>{submission.message}</p>}

      {flow.step === "authenticating" && (
        <AuthModal
          onClose={() => setFlow({ step: "closed" })}
          onAuthenticated={() => setFlow({ step: "resolvingEligibility" })}
        />
      )}

      {flow.step === "picking" && (
        <FlagColorPicker
          submitting={submission.status === "submitting"}
          onPick={handlePick}
          onClose={() => setFlow({ step: "closed" })}
        />
      )}
    </div>
  );
}
