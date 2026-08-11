import { Router } from "express";
import { UserRepository } from "../../domain/ports/userRepository";
import { BeachRepository } from "../../domain/ports/beachRepository";
import { createUserController } from "../controllers/user.controller";
import { AuthTokenVerifier } from "../../domain/ports/authTokenVerifier";
import { createRequireAuth } from "../middleware/requireAuth";

export function createUserRouter(
  userRepository: UserRepository,
  beachRepository: BeachRepository,
  tokenVerifier: AuthTokenVerifier,
): Router {
  const router = Router();
  const requireAuth = createRequireAuth(tokenVerifier, userRepository);
  const controller = createUserController({ userRepository, beachRepository });

  router.post("/beaches/:beachId/save", requireAuth, controller.saveBeach);
  router.delete("/beaches/:beachId/save", requireAuth, controller.unsaveBeach);
  router.get("/beaches/saved", requireAuth, controller.getSavedBeaches);

  return router;
}
