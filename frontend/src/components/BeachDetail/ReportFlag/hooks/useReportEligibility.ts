import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { fetchReportStatus } from "../data/fetchReportStatus";
import { isOutsideLegalWindow } from "../../utils/legalWindow";
import type { ReportedFlag } from "../interfaces";

export type ReportEligibility =
  | { status: "checking" }
  | { status: "unauthenticated" }
  | { status: "ineligible"; reason: string }
  | { status: "already-reported"; reported: ReportedFlag }
  | { status: "eligible" };

export interface ReportEligibilityControls {
  /** Optimistically marks this beach as already-reported-today with the given report, without waiting on a refetch. */
  markReportedToday: (reported: ReportedFlag) => void;
  /** Re-fetches report status from the server — used when a duplicate-submission race means the color that actually won isn't necessarily the one this client just attempted. */
  refetch: () => Promise<void>;
}

type ReportStatusState =
  | { kind: "known"; alreadyReported: false }
  // reported is required (not optional) whenever alreadyReported is true — the type itself
  // rules out the "reported today but we don't know what color" state, so deriving eligibility
  // below never has to guess a default for a field the server should always have sent.
  | { kind: "known"; alreadyReported: true; reported: ReportedFlag }
  // The server round trip itself failed (network blip, backend briefly unavailable, ...) rather
  // than resolving one way or the other — kept distinct from "known" so a transient failure can't
  // be mistaken for a genuine "not reported yet" and invite a vote that duplicates one already on
  // record (see the eligibility derivation below, which fails this closed to "ineligible").
  | { kind: "check-failed" };

/**
 * Combines auth state and the client-side legal window check (both derivable locally) with a
 * server round trip for today's already-reported status (and, if reported, which color) — the
 * one piece of eligibility that can't be known without asking the backend.
 */
export function useReportEligibility(
  beachId: string,
  user: User | null,
  authLoading: boolean
): [ReportEligibility, ReportEligibilityControls] {
  const outsideWindow = isOutsideLegalWindow();
  const canCheckServer = Boolean(user) && user!.emailVerified && !outsideWindow;
  const [reportStatus, setReportStatus] = useState<ReportStatusState | null>(null);

  const refetch = useCallback(async () => {
    if (!user) return;
    try {
      const result = await fetchReportStatus(beachId, user);
      setReportStatus(
        result.alreadyReportedToday
          ? { kind: "known", alreadyReported: true, reported: result.reported }
          : { kind: "known", alreadyReported: false }
      );
    } catch {
      // Fail closed rather than leaving "checking" forever: a failed status check is not the
      // same thing as a confirmed "not reported yet", and defaulting it to eligible here used to
      // let a visitor whose earlier report the server just couldn't confirm see the picker again
      // and re-vote instead of the already-reported notice they should still be seeing.
      setReportStatus({ kind: "check-failed" });
    }
  }, [beachId, user]);

  useEffect(() => {
    if (!canCheckServer || !user) {
      setReportStatus(null);
      return;
    }

    let cancelled = false;
    fetchReportStatus(beachId, user)
      .then((result) => {
        if (!cancelled) {
          setReportStatus(
            result.alreadyReportedToday
              ? { kind: "known", alreadyReported: true, reported: result.reported }
              : { kind: "known", alreadyReported: false }
          );
        }
      })
      .catch(() => {
        if (!cancelled) setReportStatus({ kind: "check-failed" });
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
  } else if (reportStatus === null) {
    eligibility = { status: "checking" };
  } else if (reportStatus.kind === "check-failed") {
    eligibility = { status: "ineligible", reason: "Could not check report status" };
  } else if (reportStatus.alreadyReported) {
    // Its own status rather than a generic "ineligible" + reason string: callers now
    // branch on this specifically to swap in the ReportedTodayNotice card copy.
    eligibility = { status: "already-reported", reported: reportStatus.reported };
  } else {
    eligibility = { status: "eligible" };
  }

  return [
    eligibility,
    {
      markReportedToday: (reported: ReportedFlag) => setReportStatus({ kind: "known", alreadyReported: true, reported }),
      refetch,
    },
  ];
}
