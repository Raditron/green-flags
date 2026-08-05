import { Router } from "express";
import { BeachRepository } from "../../domain/ports/beachRepository";
import { listBeaches } from "../../application/useCases/listBeaches";

export function createBeachRouter(repository: BeachRepository): Router {
  const router = Router();

  router.get("/beaches", async (_req, res) => {
    try {
      const beaches = await listBeaches(repository);
      res.status(200).json({ beaches });
    } catch (error) {
      res.status(503).json({ status: "error", message: "Database unavailable" });
    }
  });

  return router;
}
