import { RequestHandler } from "express";
import { HealthcheckRepository } from "../../../domain/ports/health/healthcheckRepository";
import { runHealthcheck } from "../../../application/useCases/health/runHealthcheck";

export interface HealthControllerDependencies {
  healthcheckRepository: HealthcheckRepository;
}

export function createHealthController(dependencies: HealthControllerDependencies): { get: RequestHandler } {
  return {
    get: async (_req, res) => {
      try {
        const result = await runHealthcheck(dependencies.healthcheckRepository);
        res.status(200).json(result);
      } catch (error) {
        res.status(503).json({ status: "error", message: "Database unavailable" });
      }
    },
  };
}
