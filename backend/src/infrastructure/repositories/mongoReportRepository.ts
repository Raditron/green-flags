import { Collection, Db } from "mongodb";
import { ReportRepository } from "../../domain/ports/reportRepository";

/** One registered user's report of the actual flag they observed against the rule engine's call for that beach/hour. Written by the feedback submission feature (issue #9). */
interface ReportDocument {
  beachId: string;
  date: string;
  hour: number;
  bucketKey: string;
  agreesWithPrediction: boolean;
  userId: string;
  createdAt: Date;
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
}
