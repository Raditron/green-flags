import { Router } from "express";
import { AuthTokenVerifier } from "../../../domain/ports/auth/authTokenVerifier";
import { UserRepository } from "../../../domain/ports/user/userRepository";
import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { CommentRepository } from "../../../domain/ports/comment/commentRepository";
import { createRequireAuth } from "../../middleware/requireAuth";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail";
import { createCommentController } from "../../controllers/comment/comment.controller";

export function createCommentRouter(
  userRepository: UserRepository,
  beachRepository: BeachRepository,
  commentRepository: CommentRepository,
  tokenVerifier: AuthTokenVerifier,
): Router {
  const router = Router();
  const requireAuth = createRequireAuth(tokenVerifier, userRepository);
  const controller = createCommentController({
    userRepository,
    beachRepository,
    commentRepository,
  });

  router.get("/beaches/:beachId/comments", controller.listCommentsForBeach);
  router.post(
    "/beaches/:beachId/comments",
    requireAuth,
    requireVerifiedEmail,
    controller.addComment,
  );
  router.delete(
    "/beaches/:beachId/comments/:commentId",
    requireAuth,
    controller.deleteComment,
  );

  return router;
}
