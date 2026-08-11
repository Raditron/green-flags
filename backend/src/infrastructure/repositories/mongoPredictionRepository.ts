import { Collection, Db } from "mongodb";
import { BeachDailyPredictions, HourlyPrediction, PredictionRepository } from "../../domain/ports/prediction/predictionRepository";

interface PredictionDocument {
  _id: string;
  beachId: string;
  date: string;
  hourlyPredictions: HourlyPrediction[];
  computedAt: Date;
}

function documentId(beachId: string, date: string): string {
  return `${beachId}_${date}`;
}

export class MongoPredictionRepository implements PredictionRepository {
  private readonly collection: Collection<PredictionDocument>;

  constructor(db: Db) {
    this.collection = db.collection<PredictionDocument>("predictions");
    // Backs getDailyPredictions()'s `{ date }` filter; fire-and-forget since createIndex is
    // idempotent and the driver queues operations until the connection is ready.
    void this.collection.createIndex({ date: 1 }).catch(() => {});
  }

  async saveDailyPredictions(predictions: BeachDailyPredictions): Promise<void> {
    await this.collection.updateOne(
      { _id: documentId(predictions.beachId, predictions.date) },
      {
        $set: {
          beachId: predictions.beachId,
          date: predictions.date,
          hourlyPredictions: predictions.hourlyPredictions,
          computedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  async findByBeachAndDate(beachId: string, date: string): Promise<BeachDailyPredictions | null> {
    const doc = await this.collection.findOne({ _id: documentId(beachId, date) });
    if (!doc) return null;

    return { beachId: doc.beachId, date: doc.date, hourlyPredictions: doc.hourlyPredictions };
  }
  async getDailyPredictions(date: string): Promise<BeachDailyPredictions[] | null> {
    // Filtered by Mongo, not fetched in full and filtered in app code — this collection accrues
    // one document per beach per day forever, so an unfiltered find() grows without bound.
    const docs = await this.collection.find({ date }).toArray();
    if (!docs || docs.length === 0) return null;

    return docs.map(doc => ({
      beachId: doc.beachId,
      date: doc.date,
      hourlyPredictions: doc.hourlyPredictions,
    }));
  }
}
