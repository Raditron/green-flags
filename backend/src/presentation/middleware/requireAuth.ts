import { NextFunction, Request, Response } from "express";
import { AuthTokenVerifier } from "../../domain/ports/auth/authTokenVerifier";
import { UserRecord, UserRepository } from "../../domain/ports/user/userRepository";
import { authenticateUser, InvalidAuthTokenError } from "../../application/useCases/auth/authenticateUser";

const BEARER_PREFIX = "Bearer ";

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

function extractBearerToken(header: string | undefined): string | undefined {
  if (!header?.startsWith(BEARER_PREFIX)) return undefined;
  const token = header.slice(BEARER_PREFIX.length).trim();
  return token.length > 0 ? token : undefined;
}

/** Verifies the caller's Firebase ID token and attaches the resulting `req.user`, via the `authenticateUser` use case. */
export function createRequireAuth(tokenVerifier: AuthTokenVerifier, userRepository: UserRepository) {
  return async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const idToken = extractBearerToken(req.header("authorization"));

    if (!idToken) {
      res.status(401).json({ status: "error", message: "Missing or invalid Authorization header" });
      return;
    }

    try {
      req.user = await authenticateUser(tokenVerifier, userRepository, idToken);
      next();
    } catch (error) {
      if (error instanceof InvalidAuthTokenError) {
        res.status(401).json({ status: "error", message: "Invalid or expired token" });
      } else {
        res.status(503).json({ status: "error", message: "Database unavailable" });
      }
    }
  };
}
