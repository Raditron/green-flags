import { Router } from "express";
import { BeachRepository } from "../../domain/ports/beachRepository";
import { ForecastProvider } from "../../domain/ports/forecastProvider";
import { StormWarningProvider } from "../../domain/ports/stormWarningProvider";
import { PredictionRepository } from "../../domain/ports/predictionRepository";
import { ReportRepository } from "../../domain/ports/reportRepository";
import { createBatchSecretAuth } from "../middleware/batchSecretAuth";
import { createBatchController } from "../controllers/batch.controller";

export interface BatchRouteDependencies {
  beachRepository: BeachRepository;
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
  reportRepository: ReportRepository;
  batchTriggerSecret: string;
}

export function createBatchRouter(dependencies: BatchRouteDependencies): Router {
  const router = Router();
  const controller = createBatchController(dependencies);

  router.post("/batch", createBatchSecretAuth(dependencies.batchTriggerSecret), controller.run);

  return router;
}
