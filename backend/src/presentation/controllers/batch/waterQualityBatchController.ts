import { RequestHandler } from "express";
import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { WaterQualityProvider } from "../../../domain/ports/batch/waterQualityProvider";
import { runWaterQualityBatch } from "../../../application/useCases/batch/runWaterQualityBatch";

export interface WaterQualityBatchControllerDependencies {
  beachRepository: BeachRepository;
  waterQualityProvider: WaterQualityProvider;
}

export function createWaterQualityBatchController(dependencies: WaterQualityBatchControllerDependencies): { run: RequestHandler } {
  return {
    run: async (_req, res) => {
      try {
        const result = await runWaterQualityBatch(dependencies);
        if (result.failures.length > 0) {
          res.status(207).json({ status: "partial", ...result });
        } else {
          res.status(200).json({ status: "ok", ...result });
        }
      } catch (error) {
        res.status(502).json({ status: "error", message: "Water-quality batch run failed" });
      }
    },
  };
}
