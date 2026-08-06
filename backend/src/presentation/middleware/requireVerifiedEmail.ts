import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./requireAuth";

/** Must run after `requireAuth` — relies on `req.user` already being populated. */
export function requireVerifiedEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user?.emailVerified) {
    res.status(403).json({ status: "error", code: "email_not_verified", message: "Verify your email first" });
    return;
  }

  next();
}
