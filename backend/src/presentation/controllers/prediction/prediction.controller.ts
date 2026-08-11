import { RequestHandler } from "express";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { getBeachPredictions } from "../../../application/useCases/prediction/getBeachPredictions";
import { resolvePredictionDate } from "../../../domain/shared/today";
import { getDailyBlackSeaSummary } from "../../../application/useCases/prediction/getDailyBlackSeaSummary";
import { BeachRepository } from "../../../domain/ports/beach/beachRepository";

export interface PredictionControllerDependencies {
  predictionRepository: PredictionRepository;
  beachRepository: BeachRepository;
}

export function createPredictionController(
  dependencies: PredictionControllerDependencies,
): { get: RequestHandler; getDailySummary: RequestHandler } {
  return {
    get: async (req, res) => {
      const rawDate =
        typeof req.query.date === "string" ? req.query.date : undefined;
      const date = resolvePredictionDate(rawDate);

      if (!date) {
        res
          .status(400)
          .json({
            status: "error",
            message: "date must be formatted as YYYY-MM-DD",
          });
        return;
      }

      try {
        const predictions = await getBeachPredictions(
          dependencies.predictionRepository,
          req.params.beachId,
          date,
        );
        if (!predictions) {
          res
            .status(404)
            .json({
              status: "error",
              message: "No predictions found for this beach and date",
            });
          return;
        }
        res.status(200).json(predictions);
      } catch (error) {
        res
          .status(503)
          .json({ status: "error", message: "Database unavailable" });
      }
    },

    getDailySummary: async (_req, res) => {
      try {
        const summary = await getDailyBlackSeaSummary(
          dependencies.predictionRepository,
          dependencies.beachRepository,
        );
        res.status(200).json(summary);
      } catch (error) {
        res
          .status(503)
          .json({ status: "error", message: "Database unavailable" });
      }
    },
  };
}
