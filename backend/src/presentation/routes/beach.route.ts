import { Router } from "express";
import { BeachRepository } from "../../domain/ports/beachRepository";
import { PredictionRepository } from "../../domain/ports/predictionRepository";
import { createBeachController } from "../controllers/beach.controller";

export function createBeachRouter(repository: BeachRepository, predictionRepository: PredictionRepository): Router {
  const router = Router();
  const controller = createBeachController({ beachRepository: repository, predictionRepository });

  router.get("/beaches", controller.list);

  return router;
}
