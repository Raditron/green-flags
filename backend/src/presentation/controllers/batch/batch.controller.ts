import { RequestHandler } from "express";
import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { ForecastProvider } from "../../../domain/ports/batch/forecastProvider";
import { StormWarningProvider } from "../../../domain/ports/batch/stormWarningProvider";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { SelfConsistencyRepository } from "../../../domain/ports/prediction/selfConsistencyRepository";
import { ReportRepository } from "../../../domain/ports/report/reportRepository";
import { runDailyBatch } from "../../../application/useCases/batch/runDailyBatch";

export interface BatchControllerDependencies {
  beachRepository: BeachRepository;
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
  selfConsistencyRepository: SelfConsistencyRepository;
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
          selfConsistencyRepository: dependencies.selfConsistencyRepository,
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
