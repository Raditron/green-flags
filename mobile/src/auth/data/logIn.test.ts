import * as firebaseAuth from "firebase/auth";
import { logIn } from "./logIn";

jest.mock("../../firebase", () => ({ auth: {} }));
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(async () => {}),
}));

const mockAuth = jest.requireMock("../../firebase").auth;

describe("logIn", () => {
  it("calls signInWithEmailAndPassword with the auth instance and the given credentials", async () => {
    await logIn("diver@example.com", "password123");

    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      "diver@example.com",
      "password123",
    );
  });

  it("propagates a rejected sign-in (e.g. wrong password) to the caller", async () => {
    jest.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(new Error("invalid-credential"));

    await expect(logIn("diver@example.com", "wrong")).rejects.toThrow("invalid-credential");
  });
});
