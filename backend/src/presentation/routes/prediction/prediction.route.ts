import { Router } from "express";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { createPredictionController } from "../../controllers/prediction/prediction.controller";
import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { createDailySummaryRateLimit } from "../../middleware/dailySummaryRateLimit";

export function createPredictionRouter(
  predictionRepository: PredictionRepository,
  beachRepository: BeachRepository,
): Router {
  const router = Router();
  const controller = createPredictionController({
    predictionRepository,
    beachRepository,
  });

  router.get("/beaches/:beachId/predictions", controller.get);
  // Public and unauthenticated by design, unlike the rest of this API's routes — rate-limited
  // so it can't be used as a free trigger for repeated full aggregation runs.
  router.get("/daily-summary", createDailySummaryRateLimit(), controller.getDailySummary);
  return router;
}
