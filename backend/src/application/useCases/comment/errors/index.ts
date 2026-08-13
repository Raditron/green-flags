/** Thrown when a user attempts to delete a comment they don't own — an authorization decision the use case makes, not a repository contract failure. */
export class UnauthorizedCommentDeleteError extends Error {
  constructor(message = "You are not authorized to delete this comment") {
    super(message);
  }
}
