import { Router } from "express";
import { UserRepository } from "../../../domain/ports/user/userRepository";
import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { createUserController } from "../../controllers/user/user.controller";
import { AuthTokenVerifier } from "../../../domain/ports/auth/authTokenVerifier";
import { createRequireAuth } from "../../middleware/requireAuth";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail";

export function createUserRouter(
  userRepository: UserRepository,
  beachRepository: BeachRepository,
  predictionRepository: PredictionRepository,
  tokenVerifier: AuthTokenVerifier,
): Router {
  const router = Router();
  const requireAuth = createRequireAuth(tokenVerifier, userRepository);
  const controller = createUserController({ userRepository, beachRepository, predictionRepository });

  // Trivial route proving the auth middleware chain end to end (mirrors what /api/health proves for
  // the DB path) — not otherwise needed by the frontend, which reads auth state straight off the
  // Firebase client SDK.
  router.get("/me", requireAuth, requireVerifiedEmail, controller.getMe);

  router.post("/beaches/:beachId/save", requireAuth, controller.saveBeach);
  router.delete("/beaches/:beachId/save", requireAuth, controller.unsaveBeach);
  router.get("/beaches/saved", requireAuth, controller.getSavedBeaches);

  return router;
}
