import { ForecastProvider } from "../../src/domain/ports/batch/forecastProvider";
import { StormWarningProvider } from "../../src/domain/ports/batch/stormWarningProvider";
import { PredictionRepository } from "../../src/domain/ports/prediction/predictionRepository";
import { ReportRepository } from "../../src/domain/ports/report/reportRepository";
import { AuthTokenVerifier } from "../../src/domain/ports/auth/authTokenVerifier";
import { UserRepository } from "../../src/domain/ports/user/userRepository";
import { CommentRepository } from "../../src/domain/ports/comment/commentRepository";

/** Batch- and auth-related AppDependencies fields, stubbed out for tests (e.g. health/beaches) that don't exercise those routes. */
export function stubBatchDependencies(): {
  forecastProvider: ForecastProvider;
  stormWarningProvider: StormWarningProvider;
  predictionRepository: PredictionRepository;
  reportRepository: ReportRepository;
  batchTriggerSecret: string;
  authTokenVerifier: AuthTokenVerifier;
  userRepository: UserRepository;
  commentRepository: CommentRepository;
} {
  return {
    forecastProvider: {
      fetchDailyForecast: async () => ({ date: "1970-01-01", hours: [] }),
    },
    stormWarningProvider: {
      checkActiveStormWarning: async () => false,
    },
    predictionRepository: {
      saveDailyPredictions: async () => {},
      findByBeachAndDate: async () => null,
      getDailyPredictions: async () => null,
    },
    reportRepository: {
      getBucketStats: async () => ({ hits: 0, total: 0 }),
      getTodaysReports: async () => ({ agree: 0, total: 0 }),
      hasReportedToday: async () => false,
      recordReport: async () => {},
    },
    batchTriggerSecret: "test-batch-secret",
    authTokenVerifier: {
      verifyIdToken: async () => {
        throw new Error("not stubbed");
      },
    },
    userRepository: {
      findOrCreate: async (uid, claims) => ({
        uid,
        emailVerified: claims.emailVerified,
        email: claims.email ?? "",
        displayName: claims.displayName ?? "",
        savedBeaches: [],
      }),
      getUserById: async (uid) => ({ uid, emailVerified: true, email: "", displayName: "", savedBeaches: [] }),
      update: async (uid, changes) => ({
        uid,
        emailVerified: true,
        email: "",
        displayName: "",
        savedBeaches: [],
        ...changes,
      }),
    },
    commentRepository: {
      addComment: async (comment, beachId, commenterId) => ({
        id: "stub-comment-id",
        description: comment.description,
        createdOn: comment.createdOn,
        userId: commenterId,
        beachId,
      }),
      listCommentsForBeach: async () => [],
      deleteComment: async () => {},
      getCommentById: async () => {
        throw new Error("not stubbed");
      },
    },
  };
}
