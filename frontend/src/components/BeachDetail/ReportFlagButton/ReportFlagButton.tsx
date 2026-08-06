import { useEffect, useState } from "react";
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

export function ReportFlagButton({ beachId }: { beachId: string }) {
  const { user, loading: authLoading } = useAuth();
  const [eligibility, markReportedToday] = useReportEligibility(beachId, user, authLoading);
  const [flow, setFlow] = useState<Flow>({ step: "closed" });
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });

  // After a successful sign-in/sign-up, the same eligibility rules apply as for an
  // already-authenticated user — wait for eligibility to finish resolving (it may still be
  // checking today's report-status) before deciding whether to open the picker or bail out.
  useEffect(() => {
    if (flow.step !== "resolvingEligibility" || !user || eligibility.status === "checking") {
      return;
    }
    setFlow(eligibility.status === "eligible" ? { step: "picking" } : { step: "closed" });
  }, [flow.step, user, eligibility.status]);

  function handleButtonClick() {
    if (!user) {
      setFlow({ step: "authenticating" });
      return;
    }
    if (eligibility.status === "eligible") {
      setSubmission({ status: "idle" });
      setFlow({ step: "picking" });
    }
  }

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
