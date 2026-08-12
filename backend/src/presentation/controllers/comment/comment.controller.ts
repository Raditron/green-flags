import { RequestHandler } from "express";
import { UserRepository } from "../../../domain/ports/user/userRepository";
import { isValidId } from "../../../domain/shared/id";
import { addComment as addCommentUseCase } from "../../../application/useCases/comment/addComment";
import { deleteComment as deleteCommentUseCase } from "../../../application/useCases/comment/deleteComment";
import { listCommentsForBeach as listCommentsForBeachUseCase } from "../../../application/useCases/comment/listCommentsForBeach";
import {
  BeachNotFoundError,
  CommentNotFoundError,
  UnauthorizedCommentDeleteError,
  UserNotFoundError,
} from "../../../application/useCases/comment/errors";
import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { CommentRepository } from "../../../domain/ports/comment/commentRepository";
import { AuthenticatedRequest } from "../../middleware/requireAuth";

const MAX_DESCRIPTION_LENGTH = 1000;

function isValidDescription(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= MAX_DESCRIPTION_LENGTH
  );
}

export interface CommentControllerDependencies {
  userRepository: UserRepository;
  beachRepository: BeachRepository;
  commentRepository: CommentRepository;
}

export function createCommentController(
  dependencies: CommentControllerDependencies,
): {
  addComment: RequestHandler;
  deleteComment: RequestHandler;
  listCommentsForBeach: RequestHandler;
} {
  return {
    addComment: async (req: AuthenticatedRequest, res) => {
      const { beachId } = req.params;

      if (!isValidId(beachId)) {
        res.status(400).json({
          status: "error",
          code: "invalid_beach_id",
          message: "beachId must be a non-empty id",
        });
        return;
      }

      if (!isValidDescription(req.body?.description)) {
        res.status(400).json({
          status: "error",
          code: "invalid_description",
          message: `description must be a non-empty string of at most ${MAX_DESCRIPTION_LENGTH} characters`,
        });
        return;
      }

      try {
        await addCommentUseCase(
          dependencies.commentRepository,
          dependencies.beachRepository,
          dependencies.userRepository,
          req.user!.uid,
          beachId,
          req.body.description,
        );
        res.status(204).end();
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          res.status(404).json({
            status: "error",
            code: "user_not_found",
            message: "User not found",
          });
        } else if (error instanceof BeachNotFoundError) {
          res.status(404).json({
            status: "error",
            code: "beach_not_found",
            message: "Beach not found",
          });
        } else {
          res
            .status(503)
            .json({ status: "error", message: "Database unavailable" });
        }
      }
    },

    deleteComment: async (req: AuthenticatedRequest, res) => {
      const { beachId, commentId } = req.params;

      if (!isValidId(beachId)) {
        res.status(400).json({
          status: "error",
          code: "invalid_beach_id",
          message: "beachId must be a non-empty id",
        });
        return;
      }

      if (!isValidId(commentId)) {
        res.status(400).json({
          status: "error",
          code: "invalid_comment_id",
          message: "commentId must be a non-empty id",
        });
        return;
      }

      try {
        await deleteCommentUseCase(
          dependencies.commentRepository,
          dependencies.beachRepository,
          dependencies.userRepository,
          commentId,
          beachId,
          req.user!.uid,
        );
        res.status(204).end();
      } catch (error) {
        if (error instanceof BeachNotFoundError) {
          res.status(404).json({
            status: "error",
            code: "beach_not_found",
            message: "Beach not found",
          });
        } else if (error instanceof CommentNotFoundError) {
          res.status(404).json({
            status: "error",
            code: "comment_not_found",
            message: "Comment not found",
          });
        } else if (error instanceof UnauthorizedCommentDeleteError) {
          res.status(403).json({
            status: "error",
            code: "unauthorized",
            message: "You are not authorized to delete this comment",
          });
        } else if (error instanceof UserNotFoundError) {
          res.status(404).json({
            status: "error",
            code: "user_not_found",
            message: "User not found",
          });
        } else {
          res
            .status(503)
            .json({ status: "error", message: "Database unavailable" });
        }
      }
    },

    listCommentsForBeach: async (req: AuthenticatedRequest, res) => {
      const { beachId } = req.params;

      if (!isValidId(beachId)) {
        res.status(400).json({
          status: "error",
          code: "invalid_beach_id",
          message: "beachId must be a non-empty id",
        });
        return;
      }

      try {
        const comments = await listCommentsForBeachUseCase(
          dependencies.commentRepository,
          dependencies.beachRepository,
          dependencies.userRepository,
          beachId,
        );
        res.status(200).json(comments);
      } catch (error) {
        if (error instanceof BeachNotFoundError) {
          res.status(404).json({
            status: "error",
            code: "beach_not_found",
            message: "Beach not found",
          });
        } else {
          res
            .status(503)
            .json({ status: "error", message: "Database unavailable" });
        }
      }
    },
  };
}
