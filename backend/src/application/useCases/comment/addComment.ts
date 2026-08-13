import { BeachNotFoundError, BeachRepository } from "../../../domain/ports/beach/beachRepository";
import { CommentRepository } from "../../../domain/ports/comment/commentRepository";
import { UserNotFoundError, UserRepository } from "../../../domain/ports/user/userRepository";

export async function addComment(
  commentRepository: CommentRepository,
  beachRepository: BeachRepository,
  userRepository: UserRepository,
  userId: string,
  beachId: string,
  description: string,
): Promise<void> {
  const user = await userRepository.getUserById(userId);
  if (!user) throw new UserNotFoundError();
  const beach = await beachRepository.findBeachById(beachId);
  if (!beach) throw new BeachNotFoundError();

  await commentRepository.addComment(
    { description, createdOn: new Date(), userId, beachId },
    beachId,
    userId,
  );
}
