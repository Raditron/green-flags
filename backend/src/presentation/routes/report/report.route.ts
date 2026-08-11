import { Router } from "express";
import { AuthTokenVerifier } from "../../../domain/ports/auth/authTokenVerifier";
import { UserRepository } from "../../../domain/ports/user/userRepository";
import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { ReportRepository } from "../../../domain/ports/report/reportRepository";
import { createRequireAuth } from "../../middleware/requireAuth";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail";
import { createReportController } from "../../controllers/report/report.controller";

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
