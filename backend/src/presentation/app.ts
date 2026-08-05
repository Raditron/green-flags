import cors from "cors";
import express, { Express } from "express";
import { HealthcheckRepository } from "../domain/ports/healthcheckRepository";
import { BeachRepository } from "../domain/ports/beachRepository";
import { ForecastProvider } from "../domain/ports/forecastProvider";
import { StormWarningProvider } from "../domain/ports/stormWarningProvider";
import { PredictionRepository } from "../domain/ports/predictionRepository";
import { createHealthRouter } from "./routes/health.route";
import { createBeachRouter } from "./routes/beach.route";
import { createBatchRouter } from "./routes/batch.route";
import { createPredictionRouter } from "./routes/prediction.route";

export interface AppDependencies {
  healthcheckRepository: HealthcheckRepository;
  beachRepository: BeachRepository;
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
  batchTriggerSecret: string;
}

export function createApp(dependencies: AppDependencies, frontendUrl?: string): Express {
  const app = express();

  app.use(cors(frontendUrl ? { origin: frontendUrl } : undefined));
  app.use(express.json());
  app.use("/api", createHealthRouter(dependencies.healthcheckRepository));
  app.use("/api", createBeachRouter(dependencies.beachRepository));
  app.use("/api", createPredictionRouter(dependencies.predictionRepository));
  app.use(
    "/api",
    createBatchRouter({
      beachRepository: dependencies.beachRepository,
      forecastProvider: dependencies.forecastProvider,
      stormWarningProvider: dependencies.stormWarningProvider,
      predictionRepository: dependencies.predictionRepository,
      batchTriggerSecret: dependencies.batchTriggerSecret,
    })
  );

  return app;
}
