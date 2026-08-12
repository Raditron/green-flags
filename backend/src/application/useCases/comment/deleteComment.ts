import { BeachRepository } from "../../../domain/ports/beach/beachRepository";
import {
  Comment,
  CommentRepository,
} from "../../../domain/ports/comment/commentRepository";
import { UserRepository } from "../../../domain/ports/user/userRepository";
import {
  BeachNotFoundError,
  CommentNotFoundError,
  UnauthorizedCommentDeleteError,
  UserNotFoundError,
} from "./errors";

export async function deleteComment(
  commentRepository: CommentRepository,
  beachRepository: BeachRepository,
  userRepository: UserRepository,
  commentId: string,
  beachId: string,
  userId: string,
): Promise<void> {
  const beach = await beachRepository.findBeachById(beachId);
  if (!beach) throw new BeachNotFoundError();
  const user = await userRepository.getUserById(userId);
  if(!user) throw new   UserNotFoundError();
  const comment = await commentRepository.getCommentById(commentId);
  if (comment.beachId !== beachId) throw new CommentNotFoundError();
  const isCommentOwner = comment.userId === user.uid;
  if (!isCommentOwner) throw new UnauthorizedCommentDeleteError();
  await commentRepository.deleteComment(commentId);
}
