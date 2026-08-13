import { Router } from "express";
import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { ForecastProvider } from "../../../domain/ports/batch/forecastProvider";
import { StormWarningProvider } from "../../../domain/ports/batch/stormWarningProvider";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { SelfConsistencyRepository } from "../../../domain/ports/prediction/selfConsistencyRepository";
import { ReportRepository } from "../../../domain/ports/report/reportRepository";
import { createBatchSecretAuth } from "../../middleware/batchSecretAuth";
import { createBatchController } from "../../controllers/batch/batch.controller";

export interface BatchRouteDependencies {
  beachRepository: BeachRepository;
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
  selfConsistencyRepository: SelfConsistencyRepository;
  reportRepository: ReportRepository;
  batchTriggerSecret: string;
}

export function createBatchRouter(dependencies: BatchRouteDependencies): Router {
  const router = Router();
  const controller = createBatchController(dependencies);

  router.post("/batch", createBatchSecretAuth(dependencies.batchTriggerSecret), controller.run);

  return router;
}
