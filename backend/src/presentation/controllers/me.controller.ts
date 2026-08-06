import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/requireAuth";

export function createMeController(): { get: RequestHandler } {
  return {
    get: (req: AuthenticatedRequest, res) => {
      res.status(200).json(req.user);
    },
  };
}
