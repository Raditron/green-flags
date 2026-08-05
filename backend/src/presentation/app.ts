import cors from "cors";
import express, { Express } from "express";
import { HealthcheckRepository } from "../domain/ports/healthcheckRepository";
import { createHealthRouter } from "./routes/health.route";

export function createApp(healthcheckRepository: HealthcheckRepository, frontendUrl?: string): Express {
  const app = express();

  app.use(cors(frontendUrl ? { origin: frontendUrl } : undefined));
  app.use(express.json());
  app.use("/api", createHealthRouter(healthcheckRepository));

  return app;
}
