import { Collection, Db } from "mongodb";
import { HealthcheckPingResult, HealthcheckRepository } from "../../domain/ports/health/healthcheckRepository";

interface HealthcheckDocument {
  _id: "healthcheck";
  pingCount: number;
  lastPingAt: Date;
}

const HEALTHCHECK_DOCUMENT_ID = "healthcheck";

export class MongoHealthcheckRepository implements HealthcheckRepository {
  private readonly collection: Collection<HealthcheckDocument>;

  constructor(db: Db) {
    this.collection = db.collection<HealthcheckDocument>("healthchecks");
  }

  async recordPing(): Promise<HealthcheckPingResult> {
    const doc = await this.collection.findOneAndUpdate(
      { _id: HEALTHCHECK_DOCUMENT_ID },
      { $inc: { pingCount: 1 }, $set: { lastPingAt: new Date() } },
      { upsert: true, returnDocument: "after" }
    );

    if (!doc) {
      throw new Error("Healthcheck upsert did not return a document");
    }

    return { pingCount: doc.pingCount, lastPingAt: doc.lastPingAt };
  }
}
