import { RequestHandler } from "express";
import { BeachRepository } from "../../domain/ports/beachRepository";
import { PredictionRepository } from "../../domain/ports/predictionRepository";
import { ReportRepository, DuplicateReportError } from "../../domain/ports/reportRepository";
import { FlagColor } from "../../domain/rules/evaluateHourlyFlag";
import {
  BeachUnguardedError,
  NoPredictionAvailableError,
  OutsideSeasonError,
  OutsideWindowError,
  submitReport as submitReportUseCase,
} from "../../application/useCases/submitReport";
import { todayInSofia } from "../../domain/today";
import { AuthenticatedRequest } from "../middleware/requireAuth";

const VALID_FLAG_COLORS: FlagColor[] = ["green", "yellow", "red"];

function isFlagColor(value: unknown): value is FlagColor {
  return typeof value === "string" && (VALID_FLAG_COLORS as string[]).includes(value);
}

export interface ReportControllerDependencies {
  beachRepository: BeachRepository;
  predictionRepository: PredictionRepository;
  reportRepository: ReportRepository;
}

export function createReportController(
  dependencies: ReportControllerDependencies
): { submitReport: RequestHandler; getReportStatus: RequestHandler } {
  return {
    submitReport: async (req: AuthenticatedRequest, res) => {
      if (!isFlagColor(req.body?.flagColor)) {
        res.status(400).json({ status: "error", code: "invalid_flag_color", message: "flagColor must be green, yellow, or red" });
        return;
      }

      try {
        const result = await submitReportUseCase(
          dependencies.beachRepository,
          dependencies.predictionRepository,
          dependencies.reportRepository,
          {
            beachId: req.params.beachId,
            userId: req.user!.uid,
            flagColor: req.body.flagColor,
            now: new Date(),
          }
        );
        res.status(200).json(result);
      } catch (error) {
        if (error instanceof BeachUnguardedError) {
          res.status(403).json({
            status: "error",
            code: "beach_unguarded",
            message: "This beach has no lifeguard coverage — flag reports aren't collected here",
          });
        } else if (error instanceof OutsideSeasonError) {
          res.status(403).json({
            status: "error",
            code: "outside_season",
            message: "Feedback is closed for the season — beach lifeguard coverage runs June through September",
          });
        } else if (error instanceof OutsideWindowError) {
          res.status(403).json({ status: "error", code: "outside_window", message: "Outside legal hours" });
        } else if (error instanceof NoPredictionAvailableError) {
          res.status(404).json({ status: "error", code: "no_prediction", message: "No prediction available for this beach right now" });
        } else if (error instanceof DuplicateReportError) {
          res.status(409).json({ status: "error", code: "already_reported", message: "Already reported today" });
        } else {
          res.status(503).json({ status: "error", message: "Database unavailable" });
        }
      }
    },

    getReportStatus: async (req: AuthenticatedRequest, res) => {
      try {
        const alreadyReportedToday = await dependencies.reportRepository.hasReportedToday(
          req.params.beachId,
          req.user!.uid,
          todayInSofia(new Date())
        );
        res.status(200).json({ alreadyReportedToday });
      } catch (error) {
        res.status(503).json({ status: "error", message: "Database unavailable" });
      }
    },
  };
}
