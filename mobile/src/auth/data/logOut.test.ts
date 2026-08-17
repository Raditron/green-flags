import * as firebaseAuth from "firebase/auth";
import { logOut } from "./logOut";

jest.mock("../../firebase", () => ({ auth: {} }));
jest.mock("firebase/auth", () => ({
  signOut: jest.fn(async () => {}),
}));

const mockAuth = jest.requireMock("../../firebase").auth;

describe("logOut", () => {
  it("calls signOut with the auth instance", async () => {
    await logOut();

    expect(firebaseAuth.signOut).toHaveBeenCalledWith(mockAuth);
  });
});
