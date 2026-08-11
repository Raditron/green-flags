import cors from "cors";
import express, { Express } from "express";
import { HealthcheckRepository } from "../domain/ports/health/healthcheckRepository";
import { BeachRepository } from "../domain/ports/beach/beachRepository";
import { ForecastProvider } from "../domain/ports/batch/forecastProvider";
import { StormWarningProvider } from "../domain/ports/batch/stormWarningProvider";
import { PredictionRepository } from "../domain/ports/prediction/predictionRepository";
import { ReportRepository } from "../domain/ports/report/reportRepository";
import { AuthTokenVerifier } from "../domain/ports/auth/authTokenVerifier";
import { UserRepository } from "../domain/ports/user/userRepository";
import { createHealthRouter } from "./routes/health/health.route";
import { createBeachRouter } from "./routes/beach/beach.route";
import { createBatchRouter } from "./routes/batch/batch.route";
import { createPredictionRouter } from "./routes/prediction/prediction.route";
import { createReportRouter } from "./routes/report/report.route";
import { createUserRouter } from "./routes/user/user.route";

export interface AppDependencies {
  healthcheckRepository: HealthcheckRepository;
  beachRepository: BeachRepository;
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
  reportRepository: ReportRepository;
  batchTriggerSecret: string;
  authTokenVerifier: AuthTokenVerifier;
  userRepository: UserRepository;
}

export function createApp(dependencies: AppDependencies, frontendUrl?: string): Express {
  const app = express();

  // Render sits in front of the app as a single reverse-proxy hop; trusting it lets
  // express-rate-limit (on /api/daily-summary) key off the real client IP from X-Forwarded-For
  // instead of every request looking like it came from the proxy.
  app.set("trust proxy", 1);

  app.use(cors(frontendUrl ? { origin: frontendUrl } : undefined));
  app.use(express.json());
  app.use("/api", createHealthRouter(dependencies.healthcheckRepository));
  app.use("/api", createBeachRouter(dependencies.beachRepository, dependencies.predictionRepository));
  app.use("/api", createPredictionRouter(dependencies.predictionRepository, dependencies.beachRepository));
  app.use(
    "/api",
    createReportRouter(
      dependencies.beachRepository,
      dependencies.predictionRepository,
      dependencies.reportRepository,
      dependencies.authTokenVerifier,
      dependencies.userRepository
    )
  );
  app.use(
    "/api",
    createUserRouter(
      dependencies.userRepository,
      dependencies.beachRepository,
      dependencies.predictionRepository,
      dependencies.authTokenVerifier
    )
  );
  app.use(
    "/api",
    createBatchRouter({
      beachRepository: dependencies.beachRepository,
      forecastProvider: dependencies.forecastProvider,
      stormWarningProvider: dependencies.stormWarningProvider,
      predictionRepository: dependencies.predictionRepository,
      reportRepository: dependencies.reportRepository,
      batchTriggerSecret: dependencies.batchTriggerSecret,
    })
  );

  return app;
}
