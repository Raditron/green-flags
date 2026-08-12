import { Collection, Db, MongoServerError } from "mongodb";
import { DuplicateReportError, ReportInput, ReportRecord, ReportRepository } from "../../domain/ports/report/reportRepository";
import { FlagColor } from "../../domain/rules/evaluateHourlyFlag";

const DUPLICATE_KEY_ERROR_CODE = 11000;

/** One registered user's report of the actual flag they observed against the rule engine's call for that beach/hour. Written by the feedback submission feature (issue #9). */
interface ReportDocument {
  _id: string;
  beachId: string;
  date: string;
  hour: number;
  bucketKey: string;
  agreesWithPrediction: boolean;
  flagColor: FlagColor;
  userId: string;
  createdAt: Date;
}

/** Deterministic per-user-per-beach-per-day key, so a duplicate submission fails on Mongo's own _id uniqueness rather than needing a separately-managed index. */
function documentId(beachId: string, userId: string, date: string): string {
  return `${beachId}_${userId}_${date}`;
}

export class MongoReportRepository implements ReportRepository {
  private readonly collection: Collection<ReportDocument>;

  constructor(db: Db) {
    this.collection = db.collection<ReportDocument>("reports");
  }

  async getBucketStats(beachId: string, bucketKey: string, excludeDate: string): Promise<{ hits: number; total: number }> {
    const filter = { beachId, bucketKey, date: { $ne: excludeDate } };
    const [total, hits] = await Promise.all([
      this.collection.countDocuments(filter),
      this.collection.countDocuments({ ...filter, agreesWithPrediction: true }),
    ]);
    return { hits, total };
  }

  async getTodaysReports(beachId: string, date: string, hour: number): Promise<{ agree: number; total: number }> {
    const filter = { beachId, date, hour };
    const [total, agree] = await Promise.all([
      this.collection.countDocuments(filter),
      this.collection.countDocuments({ ...filter, agreesWithPrediction: true }),
    ]);
    return { agree, total };
  }

  async getTodaysReport(beachId: string, userId: string, date: string): Promise<ReportRecord | null> {
    const doc = await this.collection.findOne({ _id: documentId(beachId, userId, date) });
    if (!doc) {
      return null;
    }
    return {
      beachId: doc.beachId,
      userId: doc.userId,
      date: doc.date,
      flagColor: doc.flagColor,
      agreesWithPrediction: doc.agreesWithPrediction,
    };
  }

  async recordReport(report: ReportInput): Promise<void> {
    try {
      await this.collection.insertOne({
        _id: documentId(report.beachId, report.userId, report.date),
        beachId: report.beachId,
        userId: report.userId,
        date: report.date,
        hour: report.hour,
        bucketKey: report.bucketKey,
        agreesWithPrediction: report.agreesWithPrediction,
        flagColor: report.flagColor,
        createdAt: new Date(),
      });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === DUPLICATE_KEY_ERROR_CODE) {
        throw new DuplicateReportError();
      }
      throw error;
    }
  }
}
