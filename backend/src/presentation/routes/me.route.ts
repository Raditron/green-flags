import { Router } from "express";
import { AuthTokenVerifier } from "../../domain/ports/authTokenVerifier";
import { UserRepository } from "../../domain/ports/userRepository";
import { AuthenticatedRequest, createRequireAuth } from "../middleware/requireAuth";
import { requireVerifiedEmail } from "../middleware/requireVerifiedEmail";

/**
 * Trivial route proving the auth middleware chain end to end (mirrors what /api/health proves for
 * the DB path) — not otherwise needed by the frontend, which reads auth state straight off the
 * Firebase client SDK.
 */
export function createMeRouter(tokenVerifier: AuthTokenVerifier, userRepository: UserRepository): Router {
  const router = Router();
  const requireAuth = createRequireAuth(tokenVerifier, userRepository);

  router.get("/me", requireAuth, requireVerifiedEmail, (req: AuthenticatedRequest, res) => {
    res.status(200).json(req.user);
  });

  return router;
}
