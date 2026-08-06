import { Router } from "express";
import { PredictionRepository } from "../../domain/ports/predictionRepository";
import { createPredictionController } from "../controllers/prediction.controller";

export function createPredictionRouter(predictionRepository: PredictionRepository): Router {
  const router = Router();
  const controller = createPredictionController({ predictionRepository });

  router.get("/beaches/:beachId/predictions", controller.get);

  return router;
}
