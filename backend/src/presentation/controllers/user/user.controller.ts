import { RequestHandler } from "express";
import { UserRepository } from "../../../domain/ports/user/userRepository";
import { isValidId } from "../../../domain/shared/id";
import { saveBeach as saveBeachUseCase } from "../../../application/useCases/user/saveBeach";
import { unsaveBeach as unsaveBeachUseCase } from "../../../application/useCases/user/unsaveBeach";
import { getSavedBeaches } from "../../../application/useCases/user/getSavedBeaches";
import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { AuthenticatedRequest } from "../../middleware/requireAuth";

export interface UserControllerDependencies {
  userRepository: UserRepository;
  beachRepository: BeachRepository;
  predictionRepository: PredictionRepository;
}

export function createUserController(
  dependencies: UserControllerDependencies,
): {
  getMe: RequestHandler;
  saveBeach: RequestHandler;
  unsaveBeach: RequestHandler;
  getSavedBeaches: RequestHandler;
} {
  return {
    getMe: (req: AuthenticatedRequest, res) => {
      res.status(200).json(req.user);
    },
    saveBeach: async (req: AuthenticatedRequest, res) => {
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
        await saveBeachUseCase(
          dependencies.userRepository,
          req.user!.uid,
          beachId,
        );
        res.status(204).end();
      } catch (error) {
        res
          .status(503)
          .json({ status: "error", message: "Database unavailable" });
      }
    },
    unsaveBeach: async (req: AuthenticatedRequest, res) => {
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
        await unsaveBeachUseCase(
          dependencies.userRepository,
          req.user!.uid,
          beachId,
        );
        res.status(204).end();
      } catch (error) {
        res
          .status(503)
          .json({ status: "error", message: "Database unavailable" });
      }
    },
    getSavedBeaches: async (req: AuthenticatedRequest, res) => {
      try {
        const beaches = await getSavedBeaches(
          dependencies.userRepository,
          dependencies.beachRepository,
          dependencies.predictionRepository,
          req.user!.uid,
        );
        res.status(200).json(beaches);
      } catch (error) {
        res
          .status(503)
          .json({ status: "error", message: "Database unavailable" });
      }
    },
  };
}
