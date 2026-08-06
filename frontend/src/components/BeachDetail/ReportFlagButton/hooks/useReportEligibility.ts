import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { fetchReportStatus } from "../data/fetchReportStatus";
import { isOutsideLegalWindow } from "../../utils/legalWindow";

export type ReportEligibility =
  | { status: "checking" }
  | { status: "unauthenticated" }
  | { status: "ineligible"; reason: string }
  | { status: "eligible" };

/**
 * Combines auth state and the client-side legal window check (both derivable locally) with a
 * server round trip for today's already-reported status — the one piece of eligibility that
 * can't be known without asking the backend. Returns a setter so the caller can optimistically
 * flip to "already reported" right after a successful submission, without waiting on a refetch.
 */
export function useReportEligibility(
  beachId: string,
  user: User | null,
  authLoading: boolean
): [ReportEligibility, () => void] {
  const outsideWindow = isOutsideLegalWindow();
  const canCheckServer = Boolean(user) && user!.emailVerified && !outsideWindow;
  const [alreadyReported, setAlreadyReported] = useState<boolean | null>(null);

  useEffect(() => {
    if (!canCheckServer || !user) {
      setAlreadyReported(null);
      return;
    }

    let cancelled = false;
    fetchReportStatus(beachId, user)
      .then((result) => {
        if (!cancelled) setAlreadyReported(result.alreadyReportedToday);
      })
      .catch(() => {
        // Fail open rather than leaving the button stuck in "checking" forever — the backend
        // enforces the one-per-day cap itself, so the worst case is a rejected duplicate POST.
        if (!cancelled) setAlreadyReported(false);
      });

    return () => {
      cancelled = true;
    };
  }, [beachId, canCheckServer, user]);

  let eligibility: ReportEligibility;
  if (authLoading) {
    eligibility = { status: "checking" };
  } else if (!user) {
    eligibility = { status: "unauthenticated" };
  } else if (!user.emailVerified) {
    eligibility = { status: "ineligible", reason: "Verify your email first" };
  } else if (outsideWindow) {
    eligibility = { status: "ineligible", reason: "Outside legal hours" };
  } else if (alreadyReported === null) {
    eligibility = { status: "checking" };
  } else if (alreadyReported) {
    eligibility = { status: "ineligible", reason: "Already reported today" };
  } else {
    eligibility = { status: "eligible" };
  }

  return [eligibility, () => setAlreadyReported(true)];
}
