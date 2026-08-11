import { RequestHandler } from "express";
import { UserRepository } from "../../domain/ports/userRepository";
import { isValidId } from "../../domain/id";
import { saveBeach as saveBeachUseCase } from "../../application/useCases/saveBeach";
import { unsaveBeach as unsaveBeachUseCase } from "../../application/useCases/unsaveBeach";
import { AuthenticatedRequest } from "../middleware/requireAuth";
import { getSavedBeaches } from "../../application/useCases/getSavedBeaches";
import { BeachRepository } from "../../domain/ports/beachRepository";

export interface UserControllerDependencies {
  userRepository: UserRepository;
  beachRepository: BeachRepository;
}

export function createUserController(
  dependencies: UserControllerDependencies,
): {
  saveBeach: RequestHandler;
  unsaveBeach: RequestHandler;
  getSavedBeaches: RequestHandler;
} {
  return {
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
