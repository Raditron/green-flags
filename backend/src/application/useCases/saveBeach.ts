import { UserRepository } from "../../domain/ports/userRepository";

/**
 * Adds a beach to the user's saved list. Idempotent — saving an already-saved beach is a no-op
 * rather than producing a duplicate entry.
 */
export async function saveBeach(
  repository: UserRepository,
  uid: string,
  beachId: string,
): Promise<void> {
  const user = await repository.getUserById(uid);

  if (user.savedBeaches.includes(beachId)) {
    return;
  }

  await repository.update(uid, {
    savedBeaches: [...user.savedBeaches, beachId],
  });
}
