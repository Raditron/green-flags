import { timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";

const BATCH_SECRET_HEADER = "x-batch-secret";

function isValidSecret(provided: string | undefined, expected: Buffer): boolean {
  if (!provided) return false;

  const providedBuffer = Buffer.from(provided);
  return providedBuffer.length === expected.length && timingSafeEqual(providedBuffer, expected);
}

/**
 * Gates the batch-trigger endpoint with its own shared-secret check, independent of the
 * user-auth chain — the batch job is called by an external scheduler (GitHub Actions cron per
 * .scratch/green-flags-mvp/issues/05-cost-effective-tech-stack.md), not a logged-in user.
 */
export function createBatchSecretAuth(expectedSecret: string) {
  const expected = Buffer.from(expectedSecret);

  return function batchSecretAuth(req: Request, res: Response, next: NextFunction): void {
    if (!isValidSecret(req.header(BATCH_SECRET_HEADER), expected)) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    next();
  };
}
