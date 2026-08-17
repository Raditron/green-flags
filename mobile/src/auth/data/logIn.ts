import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

export async function logIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}
