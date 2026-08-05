import { Router } from "express";
import { PredictionRepository } from "../../domain/ports/predictionRepository";
import { getBeachPredictions } from "../../application/useCases/getBeachPredictions";
import { resolvePredictionDate } from "../../domain/today";

export function createPredictionRouter(predictionRepository: PredictionRepository): Router {
  const router = Router();

  router.get("/beaches/:beachId/predictions", async (req, res) => {
    const rawDate = typeof req.query.date === "string" ? req.query.date : undefined;
    const date = resolvePredictionDate(rawDate);

    if (!date) {
      res.status(400).json({ status: "error", message: "date must be formatted as YYYY-MM-DD" });
      return;
    }

    try {
      const predictions = await getBeachPredictions(predictionRepository, req.params.beachId, date);
      if (!predictions) {
        res.status(404).json({ status: "error", message: "No predictions found for this beach and date" });
        return;
      }
      res.status(200).json(predictions);
    } catch (error) {
      res.status(503).json({ status: "error", message: "Database unavailable" });
    }
  });

  return router;
}
