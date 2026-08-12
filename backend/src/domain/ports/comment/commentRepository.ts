export interface Comment {
  id: string;
  description: string;
  createdOn: Date;
  userId: string;
  beachId: string;
}

/** A comment not yet persisted — the repository is responsible for minting its id. */
export type NewComment = Omit<Comment, "id">;

export interface CommentRepository {
  /** Persists a new comment, generating its id, and returns the comment as stored. */
  addComment(
    comment: NewComment,
    beachId: string,
    commenterId: string,
  ): Promise<Comment>;
  /** Looks up a single beach by id, or null if no beach with that id exists. */
  listCommentsForBeach(beachId: string): Promise<Comment[] | []>;
  deleteComment(commentId: string): Promise<void>;
  getCommentById(commentId : string) : Promise<Comment > ;
}
