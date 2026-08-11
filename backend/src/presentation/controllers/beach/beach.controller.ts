import { RequestHandler } from "express";
import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { listBeaches } from "../../../application/useCases/beach/listBeaches";

export interface BeachControllerDependencies {
  beachRepository: BeachRepository;
  predictionRepository: PredictionRepository;
}

export function createBeachController(dependencies: BeachControllerDependencies): { list: RequestHandler } {
  return {
    list: async (_req, res) => {
      try {
        const beaches = await listBeaches(dependencies.beachRepository, dependencies.predictionRepository, new Date());
        res.status(200).json({ beaches });
      } catch (error) {
        res.status(503).json({ status: "error", message: "Database unavailable" });
      }
    },
  };
}
