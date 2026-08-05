import { Router } from "express";
import { HealthcheckRepository } from "../../domain/ports/healthcheckRepository";
import { runHealthcheck } from "../../application/useCases/runHealthcheck";

export function createHealthRouter(repository: HealthcheckRepository): Router {
  const router = Router();

  router.get("/health", async (_req, res) => {
    try {
      const result = await runHealthcheck(repository);
      res.status(200).json(result);
    } catch (error) {
      res.status(503).json({ status: "error", message: "Database unavailable" });
    }
  });

  return router;
}
