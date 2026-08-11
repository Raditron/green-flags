import { Beach, BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { UserRepository } from "../../../domain/ports/user/userRepository";

/**
 * Resolves a user's saved beach ids to their full Beach records. Ids that no longer resolve to a
 * beach (e.g. deleted after being saved) are silently dropped rather than surfaced as an error.
 */
export async function getSavedBeaches(
  userRepository: UserRepository,
  beachRepository: BeachRepository,
  uid: string,
): Promise<Beach[]> {
  const user = await userRepository.getUserById(uid);

  const beaches = await Promise.all(
    user.savedBeaches.map(beachId => beachRepository.findBeachById(beachId)),
  );

  return beaches.filter((beach): beach is Beach => beach !== null);
}
