import { Router } from "express";
import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { ForecastProvider } from "../../../domain/ports/batch/forecastProvider";
import { StormWarningProvider } from "../../../domain/ports/batch/stormWarningProvider";
import { WaterQualityProvider } from "../../../domain/ports/batch/waterQualityProvider";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { SelfConsistencyRepository } from "../../../domain/ports/prediction/selfConsistencyRepository";
import { ReportRepository } from "../../../domain/ports/report/reportRepository";
import { createBatchSecretAuth } from "../../middleware/batchSecretAuth";
import { createBatchController } from "../../controllers/batch/batch.controller";
import { createWaterQualityBatchController } from "../../controllers/batch/waterQualityBatchController";

export interface BatchRouteDependencies {
  beachRepository: BeachRepository;
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  waterQualityProvider: WaterQualityProvider;
  predictionRepository: PredictionRepository;
  selfConsistencyRepository: SelfConsistencyRepository;
  reportRepository: ReportRepository;
  batchTriggerSecret: string;
}

export function createBatchRouter(dependencies: BatchRouteDependencies): Router {
  const router = Router();
  const controller = createBatchController(dependencies);
  const waterQualityController = createWaterQualityBatchController({
    beachRepository: dependencies.beachRepository,
    waterQualityProvider: dependencies.waterQualityProvider,
  });

  router.post("/batch", createBatchSecretAuth(dependencies.batchTriggerSecret), controller.run);
  // Runs on its own, far slower cadence than the daily weather batch above — see
  // .github/workflows/water-quality-batch-trigger.yml. Shares the same secret and middleware since
  // it's the same "external scheduler, not a logged-in user" trust boundary.
  router.post("/batch/water-quality", createBatchSecretAuth(dependencies.batchTriggerSecret), waterQualityController.run);

  return router;
}
