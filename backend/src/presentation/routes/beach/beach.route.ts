import { Router } from "express";
import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { createBeachController } from "../../controllers/beach/beach.controller";

export function createBeachRouter(repository: BeachRepository, predictionRepository: PredictionRepository): Router {
  const router = Router();
  const controller = createBeachController({ beachRepository: repository, predictionRepository });

  router.get("/beaches", controller.list);

  return router;
}
