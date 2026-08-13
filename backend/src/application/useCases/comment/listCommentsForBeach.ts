import { BeachNotFoundError, BeachRepository } from "../../../domain/ports/beach/beachRepository";
import {
  Comment,
  CommentRepository,
} from "../../../domain/ports/comment/commentRepository";
import { UserRepository } from "../../../domain/ports/user/userRepository";

/** A Comment enriched with its author's *current* displayName/email — distinct from the stored `Comment`, which only carries a `userId`. Never denormalized/snapshotted onto the comment itself. */
export interface CommentWithAuthor extends Comment {
  displayName: string;
  email: string;
}

export async function listCommentsForBeach(
  commentRepository: CommentRepository,
  beachRepository: BeachRepository,
  userRepository: UserRepository,
  beachId: string,
): Promise<CommentWithAuthor[]> {
  const beach = await beachRepository.findBeachById(beachId);
  if (!beach) throw new BeachNotFoundError();

  const comments = await commentRepository.listCommentsForBeach(beachId);

  const uniqueUserIds = [...new Set(comments.map((comment) => comment.userId))];
  const authorsByUserId = new Map(
    await Promise.all(
      uniqueUserIds.map(
        async (userId) => [userId, await userRepository.getUserById(userId)] as const,
      ),
    ),
  );

  return comments.map((comment) => {
    const author = authorsByUserId.get(comment.userId);
    return {
      ...comment,
      displayName: author?.displayName ?? "",
      email: author?.email ?? "",
    };
  });
}
