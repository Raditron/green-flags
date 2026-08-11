import { UserRepository } from "../../domain/ports/userRepository";

/**
 * Removes a beach from the user's saved list. Idempotent — unsaving a beach that isn't saved
 * is a no-op rather than an error.
 */
export async function unsaveBeach(
  repository: UserRepository,
  uid: string,
  beachId: string,
): Promise<void> {
  const user = await repository.getUserById(uid);

  if (!user.savedBeaches.includes(beachId)) {
    return;
  }

  await repository.update(uid, {
    savedBeaches: user.savedBeaches.filter(id => id !== beachId),
  });
}
