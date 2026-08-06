import { RequestHandler } from "express";
import { BeachRepository } from "../../domain/ports/beachRepository";
import { ForecastProvider } from "../../domain/ports/forecastProvider";
import { StormWarningProvider } from "../../domain/ports/stormWarningProvider";
import { PredictionRepository } from "../../domain/ports/predictionRepository";
import { ReportRepository } from "../../domain/ports/reportRepository";
import { runDailyBatch } from "../../application/useCases/runDailyBatch";

export interface BatchControllerDependencies {
  beachRepository: BeachRepository;
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
  reportRepository: ReportRepository;
}

export function createBatchController(dependencies: BatchControllerDependencies): { run: RequestHandler } {
  return {
    run: async (_req, res) => {
      try {
        const result = await runDailyBatch({
          beachRepository: dependencies.beachRepository,
          forecastProvider: dependencies.forecastProvider,
          stormWarningProvider: dependencies.stormWarningProvider,
          predictionRepository: dependencies.predictionRepository,
          reportRepository: dependencies.reportRepository,
          now: new Date(),
        });
        if (result.failures.length > 0) {
          res.status(207).json({ status: "partial", ...result });
        } else {
          res.status(200).json({ status: "ok", ...result });
        }
      } catch (error) {
        res.status(502).json({ status: "error", message: "Batch run failed" });
      }
    },
  };
}
