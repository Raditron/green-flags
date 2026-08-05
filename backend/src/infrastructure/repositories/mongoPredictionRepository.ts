import { Collection, Db } from "mongodb";
import { BeachDailyPredictions, HourlyPrediction, PredictionRepository } from "../../domain/ports/predictionRepository";

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
}
