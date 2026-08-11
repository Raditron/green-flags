import { Router } from "express";
import { HealthcheckRepository } from "../../../domain/ports/health/healthcheckRepository";
import { createHealthController } from "../../controllers/health/health.controller";

export function createHealthRouter(repository: HealthcheckRepository): Router {
  const router = Router();
  const controller = createHealthController({ healthcheckRepository: repository });

  router.get("/health", controller.get);

  return router;
}
