/** Thrown when the commenting user's id doesn't resolve to a user document. */
export class UserNotFoundError extends Error {
  constructor(message = "User not found") {
    super(message);
  }
}
/** Thrown when the target beach id doesn't resolve to a beach document. */
export class BeachNotFoundError extends Error {
  constructor(message = "Beach not found") {
    super(message);
  }
}
/** Thrown when the target comment id doesn't resolve to a comment document. */
export class CommentNotFoundError extends Error {
  constructor(message = "Comment not found") {
    super(message);
  }
}
/** Thrown when a user attempts to delete a comment they don't own. */
export class UnauthorizedCommentDeleteError extends Error {
  constructor(message = "You are not authorized to delete this comment") {
    super(message);
  }
}