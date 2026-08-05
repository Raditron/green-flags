import cors from "cors";
import express, { Express } from "express";
import { HealthcheckRepository } from "../domain/ports/healthcheckRepository";
import { BeachRepository } from "../domain/ports/beachRepository";
import { createHealthRouter } from "./routes/health.route";
import { createBeachRouter } from "./routes/beach.route";

export interface AppDependencies {
  healthcheckRepository: HealthcheckRepository;
  beachRepository: BeachRepository;
}

export function createApp(dependencies: AppDependencies, frontendUrl?: string): Express {
  const app = express();

  app.use(cors(frontendUrl ? { origin: frontendUrl } : undefined));
  app.use(express.json());
  app.use("/api", createHealthRouter(dependencies.healthcheckRepository));
  app.use("/api", createBeachRouter(dependencies.beachRepository));

  return app;
}
