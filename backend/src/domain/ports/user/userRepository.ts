export interface UserRecord {
  uid: string;
  emailVerified: boolean;
  /** Never undefined — defaulted to "" at the infrastructure boundary when the underlying claim/document field is absent. */
  email: string;
  /** Never undefined — defaulted to "" at the infrastructure boundary when the underlying claim/document field is absent. */
  displayName: string;
  savedBeaches: string[];
}

/**
 * The `users` collection mirrors Firebase-authenticated accounts in MongoDB, keyed by Firebase
 * UID — the natural place to hang feedback-cap uniqueness constraints and moderation state once
 * those features land (see .scratch/green-flags-mvp/issues/07-auth-implementation.md).
 */
export interface UserRepository {
  /** Creates the user document on first sight of this UID, otherwise syncs claims to the token's current values. */
  findOrCreate(
    uid: string,
    claims: { emailVerified: boolean; email?: string; displayName?: string },
  ): Promise<UserRecord>;
  /** Patches only the supplied fields on the user document, leaving the rest untouched. */
  getUserById(uid: string): Promise<UserRecord>;
  update(
    uid: string,
    changes: Partial<Omit<UserRecord, "uid">>,
  ): Promise<UserRecord>;
}
