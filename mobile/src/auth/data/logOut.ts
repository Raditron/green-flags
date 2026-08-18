import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export async function logOut(): Promise<void> {
  await signOut(auth);
}
