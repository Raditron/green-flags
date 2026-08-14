import { Collection, Db } from "mongodb";
import {
  SelfConsistencyOutcome,
  SelfConsistencyRepository,
  SelfConsistencyStats,
} from "../../domain/ports/prediction/selfConsistencyRepository";
import { LeadTier } from "../../domain/rules/lead";

interface SelfConsistencyDocument {
  _id: string;
  bucketKey: string;
  leadTier: LeadTier;
  hits: number;
  total: number;
}

function documentId(bucketKey: string, leadTier: LeadTier): string {
  return `${bucketKey}_${leadTier}`;
}

export class MongoSelfConsistencyRepository implements SelfConsistencyRepository {
  private readonly collection: Collection<SelfConsistencyDocument>;

  constructor(db: Db) {
    this.collection = db.collection<SelfConsistencyDocument>("selfConsistencyStats");
  }

  async getStats(bucketKey: string, leadTier: LeadTier): Promise<SelfConsistencyStats> {
    const doc = await this.collection.findOne({ _id: documentId(bucketKey, leadTier) });
    return { hits: doc?.hits ?? 0, total: doc?.total ?? 0 };
  }

  async recordOutcomes(outcomes: SelfConsistencyOutcome[]): Promise<void> {
    if (outcomes.length === 0) return;

    // Fold same-(bucket, tier) outcomes together first so each tally gets a single atomic $inc
    // rather than one round trip per hour graded.
    const tallies = new Map<string, { bucketKey: string; leadTier: LeadTier; hits: number; total: number }>();
    for (const outcome of outcomes) {
      const key = documentId(outcome.bucketKey, outcome.leadTier);
      const tally = tallies.get(key) ?? { bucketKey: outcome.bucketKey, leadTier: outcome.leadTier, hits: 0, total: 0 };
      tally.total += 1;
      if (outcome.hit) tally.hits += 1;
      tallies.set(key, tally);
    }

    await Promise.all(
      Array.from(tallies.entries()).map(([id, tally]) =>
        this.collection.updateOne(
          { _id: id },
          {
            $inc: { hits: tally.hits, total: tally.total },
            $setOnInsert: { bucketKey: tally.bucketKey, leadTier: tally.leadTier },
          },
          { upsert: true }
        )
      )
    );
  }
}
