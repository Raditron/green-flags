import { Collection, Db } from "mongodb";
import { BeachDailyPredictions, HourlyPrediction, PredictionRepository } from "../../domain/ports/prediction/predictionRepository";

interface PredictionDocument {
  _id: string;
  beachId: string;
  date: string;
  issuedDate: string;
  hourlyPredictions: HourlyPrediction[];
  computedAt: Date;
}

function documentId(beachId: string, date: string, issuedDate: string): string {
  return `${beachId}_${date}_${issuedDate}`;
}

function toBeachDailyPredictions(doc: PredictionDocument): BeachDailyPredictions {
  return { beachId: doc.beachId, date: doc.date, issuedDate: doc.issuedDate, hourlyPredictions: doc.hourlyPredictions };
}

export class MongoPredictionRepository implements PredictionRepository {
  private readonly collection: Collection<PredictionDocument>;

  constructor(db: Db) {
    this.collection = db.collection<PredictionDocument>("predictions");
    // Backs getDailyPredictions()'s `{ date }` filter and findByBeachAndDate()'s freshest-Lead
    // sort; fire-and-forget since createIndex is idempotent and the driver queues operations
    // until the connection is ready.
    void this.collection.createIndex({ date: 1, issuedDate: -1 }).catch(() => {});
    void this.collection.createIndex({ beachId: 1, date: 1, issuedDate: -1 }).catch(() => {});
  }

  async saveDailyPredictions(predictions: BeachDailyPredictions): Promise<void> {
    await this.collection.updateOne(
      { _id: documentId(predictions.beachId, predictions.date, predictions.issuedDate) },
      {
        $set: {
          beachId: predictions.beachId,
          date: predictions.date,
          issuedDate: predictions.issuedDate,
          hourlyPredictions: predictions.hourlyPredictions,
          computedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  async findByBeachAndDate(beachId: string, date: string): Promise<BeachDailyPredictions | null> {
    // Largest issuedDate first == smallest Lead == freshest Prediction for this target date.
    const doc = await this.collection.find({ beachId, date }).sort({ issuedDate: -1 }).limit(1).next();
    return doc ? toBeachDailyPredictions(doc) : null;
  }

  async getDailyPredictions(date: string): Promise<BeachDailyPredictions[] | null> {
    // Freshest-per-beach picked by Mongo's aggregation pipeline, not fetched in full and reduced in
    // app code — this collection accrues one document per beach per Lead per day forever, so
    // fetching every issued-date doc per beach just to discard all but one in JS grows unbounded.
    const docs = await this.collection
      .aggregate<PredictionDocument>([
        { $match: { date } },
        { $sort: { issuedDate: -1 } },
        { $group: { _id: "$beachId", doc: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$doc" } },
      ])
      .toArray();
    if (!docs || docs.length === 0) return null;

    return docs.map(toBeachDailyPredictions);
  }

  async getIssuedPredictionsForTargetDate(date: string): Promise<BeachDailyPredictions[]> {
    const docs = await this.collection.find({ date }).toArray();
    return docs.map(toBeachDailyPredictions);
  }
}
