import { Router } from "express";
import { AuthTokenVerifier } from "../../domain/ports/authTokenVerifier";
import { UserRepository } from "../../domain/ports/userRepository";
import { PredictionRepository } from "../../domain/ports/predictionRepository";
import { ReportRepository } from "../../domain/ports/reportRepository";
import { createRequireAuth } from "../middleware/requireAuth";
import { requireVerifiedEmail } from "../middleware/requireVerifiedEmail";
import { createReportController } from "../controllers/report.controller";

export function createReportRouter(
  predictionRepository: PredictionRepository,
  reportRepository: ReportRepository,
  tokenVerifier: AuthTokenVerifier,
  userRepository: UserRepository
): Router {
  const router = Router();
  const requireAuth = createRequireAuth(tokenVerifier, userRepository);
  const controller = createReportController({ predictionRepository, reportRepository });

  router.post("/beaches/:beachId/reports", requireAuth, requireVerifiedEmail, controller.submitReport);
  router.get("/beaches/:beachId/report-status", requireAuth, controller.getReportStatus);

  return router;
}
