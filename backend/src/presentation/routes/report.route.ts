import { Router } from "express";
import { AuthTokenVerifier } from "../../domain/ports/authTokenVerifier";
import { UserRepository } from "../../domain/ports/userRepository";
import { BeachRepository } from "../../domain/ports/beachRepository";
import { PredictionRepository } from "../../domain/ports/predictionRepository";
import { ReportRepository } from "../../domain/ports/reportRepository";
import { createRequireAuth } from "../middleware/requireAuth";
import { requireVerifiedEmail } from "../middleware/requireVerifiedEmail";
import { createReportController } from "../controllers/report.controller";

export function createReportRouter(
  beachRepository: BeachRepository,
  predictionRepository: PredictionRepository,
  reportRepository: ReportRepository,
  tokenVerifier: AuthTokenVerifier,
  userRepository: UserRepository
): Router {
  const router = Router();
  const requireAuth = createRequireAuth(tokenVerifier, userRepository);
  const controller = createReportController({ beachRepository, predictionRepository, reportRepository });

  router.post("/beaches/:beachId/reports", requireAuth, requireVerifiedEmail, controller.submitReport);
  router.get("/beaches/:beachId/report-status", requireAuth, controller.getReportStatus);

  return router;
}
