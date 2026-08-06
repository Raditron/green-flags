import { Router } from "express";
import { BeachRepository } from "../../domain/ports/beachRepository";
import { PredictionRepository } from "../../domain/ports/predictionRepository";
import { listBeaches } from "../../application/useCases/listBeaches";

export function createBeachRouter(repository: BeachRepository, predictionRepository: PredictionRepository): Router {
  const router = Router();

  router.get("/beaches", async (_req, res) => {
    try {
      const beaches = await listBeaches(repository, predictionRepository, new Date());
      res.status(200).json({ beaches });
    } catch (error) {
      res.status(503).json({ status: "error", message: "Database unavailable" });
    }
  });

  return router;
}
