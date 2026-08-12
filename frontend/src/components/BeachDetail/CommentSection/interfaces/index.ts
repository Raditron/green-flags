export interface CommentSectionProps {
  beachId: string;
}

/** A Comment enriched with its author's *current* displayName/email — mirrors the backend's
 * CommentWithAuthor read model (see listCommentsForBeach.ts), not a snapshot taken at post time. */
export interface CommentWithAuthor {
  id: string;
  description: string;
  createdOn: string;
  userId: string;
  beachId: string;
  displayName: string;
  email: string;
}
