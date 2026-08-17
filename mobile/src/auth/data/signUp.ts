import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";

// Direct port of frontend's AuthContext.tsx signUp, extracted to its own colocated data/ function
// (see #94's "Data-layer tests" acceptance criterion). Firebase does not retroactively update an
// already-minted ID token when updateProfile runs, so the ID token is force-refreshed before
// sendEmailVerification the same way frontend's does.
export async function signUp(email: string, password: string, displayName: string): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await auth.currentUser?.getIdToken(true);
  await sendEmailVerification(credential.user);
}
