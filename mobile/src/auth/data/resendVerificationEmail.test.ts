import type { User } from "firebase/auth";
import { resendVerificationEmail } from "./resendVerificationEmail";

// Takes the signed-in `User` as a parameter (mirrors frontend's
// ReportFlag/data/submitFlagReport.ts) rather than reaching for a global `auth.currentUser` — a
// plain object literal stands in for `User` here, no firebase/auth mocking needed at all.
jest.mock("firebase/auth", () => ({
  sendEmailVerification: jest.fn(async () => {}),
}));

describe("resendVerificationEmail", () => {
  it("calls sendEmailVerification with the given user", async () => {
    const firebaseAuth = jest.requireMock("firebase/auth");
    const user = { uid: "u1" } as User;

    await resendVerificationEmail(user);

    expect(firebaseAuth.sendEmailVerification).toHaveBeenCalledWith(user);
  });
});
