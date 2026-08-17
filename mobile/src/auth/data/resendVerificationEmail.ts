import { sendEmailVerification } from "firebase/auth";
import type { User } from "firebase/auth";

// Takes the signed-in user as a parameter rather than reading `auth.currentUser` — the caller
// (AuthContext) already holds `user` in state and owns the "not signed in" guard.
export async function resendVerificationEmail(user: User): Promise<void> {
  await sendEmailVerification(user);
}
