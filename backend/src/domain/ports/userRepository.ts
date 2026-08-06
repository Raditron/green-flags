export interface UserRecord {
  uid: string;
  emailVerified: boolean;
}

/**
 * The `users` collection mirrors Firebase-authenticated accounts in MongoDB, keyed by Firebase
 * UID — the natural place to hang feedback-cap uniqueness constraints and moderation state once
 * those features land (see .scratch/green-flags-mvp/issues/07-auth-implementation.md).
 */
export interface UserRepository {
  /** Creates the user document on first sight of this UID, otherwise syncs emailVerified to the token's current claim. */
  findOrCreate(uid: string, emailVerified: boolean): Promise<UserRecord>;
}
