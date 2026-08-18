import type { User } from "firebase/auth";

// Firebase caches the emailVerified claim on the client; clicking the verification link in
// another session doesn't update it here until the ID token is force-refreshed (mirrors
// frontend's AuthContext.tsx). `reload()` mutates the given User instance in place, so a plain
// copy is returned to give React a new object reference to detect the change.
export async function refreshEmailVerified(user: User): Promise<User> {
  await user.reload();
  await user.getIdToken(true);
  return { ...user } as User;
}
