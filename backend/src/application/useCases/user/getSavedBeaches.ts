import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { PredictionRepository } from "../../../domain/ports/prediction/predictionRepository";
import { UserRepository } from "../../../domain/ports/user/userRepository";
import { currentOrNearestLegalHour, todayInSofia } from "../../../domain/shared/today";
import { buildBeachSummary, BeachSummary } from "../beach/buildBeachSummary";

/**
 * Resolves a user's saved beach ids to their enriched BeachSummary records — the same "today,
 * current legal hour" report shown on /beaches (current flag color/confidence, map image data URL),
 * so /saved never disagrees with /beaches about a beach's current status. Ids that no longer resolve
 * to a beach (e.g. deleted after being saved) are silently dropped rather than surfaced as an error.
 */
export async function getSavedBeaches(
  userRepository: UserRepository,
  beachRepository: BeachRepository,
  predictionRepository: PredictionRepository,
  uid: string,
  now: Date = new Date(),
): Promise<BeachSummary[]> {
  const user = await userRepository.getUserById(uid);
  const date = todayInSofia(now);
  const hour = currentOrNearestLegalHour(now);

  const beaches = await Promise.all(
    user.savedBeaches.map(beachId => beachRepository.findBeachById(beachId)),
  );

  return Promise.all(
    beaches
      .filter((beach): beach is NonNullable<typeof beach> => beach !== null)
      .map(beach => buildBeachSummary(beach, predictionRepository, date, hour)),
  );
}
