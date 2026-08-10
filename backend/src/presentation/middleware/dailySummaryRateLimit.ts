import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

const WINDOW_MS = 60_000;
/** Generous for a dashboard that reloads/polls a normal summary card, tight enough that a loop
 * hammering the route can no longer force repeated full aggregation runs for free. */
const MAX_REQUESTS_PER_WINDOW = 30;

/**
 * Throttles the public, unauthenticated daily-summary endpoint per client IP. Unlike the batch
 * route (gated by a shared secret) or the report/me routes (gated by Firebase auth), this one is
 * deliberately open to anonymous dashboard visitors, which makes it the one route on this API
 * that a bare request loop could otherwise hit for free and keep expensive.
 */
export function createDailySummaryRateLimit(): RateLimitRequestHandler {
  return rateLimit({
    windowMs: WINDOW_MS,
    limit: MAX_REQUESTS_PER_WINDOW,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ status: "error", message: "Too many requests, please try again shortly" });
    },
  });
}
