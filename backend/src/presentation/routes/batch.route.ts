import { Router } from "express";
import { BeachRepository } from "../../domain/ports/beachRepository";
import { ForecastProvider } from "../../domain/ports/forecastProvider";
import { StormWarningProvider } from "../../domain/ports/stormWarningProvider";
import { PredictionRepository } from "../../domain/ports/predictionRepository";
import { runDailyBatch } from "../../application/useCases/runDailyBatch";
import { createBatchSecretAuth } from "../middleware/batchSecretAuth";

export interface BatchRouteDependencies {
  beachRepository: BeachRepository;
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
  batchTriggerSecret: string;
}

export function createBatchRouter(dependencies: BatchRouteDependencies): Router {
  const router = Router();

  router.post("/batch", createBatchSecretAuth(dependencies.batchTriggerSecret), async (_req, res) => {
    try {
      const result = await runDailyBatch({
        beachRepository: dependencies.beachRepository,
        forecastProvider: dependencies.forecastProvider,
        stormWarningProvider: dependencies.stormWarningProvider,
        predictionRepository: dependencies.predictionRepository,
        now: new Date(),
      });
      if (result.failures.length > 0) {
        res.status(207).json({ status: "partial", ...result });
      } else {
        res.status(200).json({ status: "ok", ...result });
      }
    } catch (error) {
      res.status(502).json({ status: "error", message: "Batch run failed" });
    }
  });

  return router;
}
