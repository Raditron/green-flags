import * as firebaseAuth from "firebase/auth";
import { signUp } from "./signUp";

// Mirrors frontend's AuthModal.test.tsx firebase mock, but at the data-function seam directly —
// no rendering needed to assert the create-account call sequence. `../../firebase` is mocked
// (rather than firebase/app + firebase/auth's getAuth) since signUp only needs an `auth` object,
// not a real initializeAuth/getReactNativePersistence round trip.
jest.mock("../../firebase", () => ({ auth: { currentUser: null } }));

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(async () => {}),
  sendEmailVerification: jest.fn(async () => {}),
}));

const mockAuth = jest.requireMock("../../firebase").auth as { currentUser: unknown };
const mockUser = { getIdToken: jest.fn(async () => "fake-id-token") };

describe("signUp", () => {
  beforeEach(() => {
    mockAuth.currentUser = null;
    mockUser.getIdToken.mockClear();
    jest.mocked(firebaseAuth.createUserWithEmailAndPassword).mockReset();
    jest.mocked(firebaseAuth.updateProfile).mockClear();
    jest.mocked(firebaseAuth.sendEmailVerification).mockClear();
  });

  it("calls createUserWithEmailAndPassword, updateProfile, getIdToken(true), and sendEmailVerification in order", async () => {
    jest.mocked(firebaseAuth.createUserWithEmailAndPassword).mockImplementation(async () => {
      mockAuth.currentUser = mockUser;
      return { user: mockUser } as unknown as firebaseAuth.UserCredential;
    });

    await signUp("diver@example.com", "password123", "Diver Dan");

    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      "diver@example.com",
      "password123",
    );
    expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(mockUser, { displayName: "Diver Dan" });
    expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
    expect(firebaseAuth.sendEmailVerification).toHaveBeenCalledWith(mockUser);

    const callOrder = [
      jest.mocked(firebaseAuth.createUserWithEmailAndPassword).mock.invocationCallOrder[0],
      jest.mocked(firebaseAuth.updateProfile).mock.invocationCallOrder[0],
      mockUser.getIdToken.mock.invocationCallOrder[0],
      jest.mocked(firebaseAuth.sendEmailVerification).mock.invocationCallOrder[0],
    ];
    expect(callOrder).toEqual([...callOrder].sort((a, b) => a - b));
  });

  it("propagates the failure and calls nothing else when account creation itself fails", async () => {
    jest.mocked(firebaseAuth.createUserWithEmailAndPassword).mockRejectedValue(new Error("email-already-in-use"));

    await expect(signUp("diver@example.com", "password123", "Diver Dan")).rejects.toThrow("email-already-in-use");
    expect(firebaseAuth.updateProfile).not.toHaveBeenCalled();
    expect(firebaseAuth.sendEmailVerification).not.toHaveBeenCalled();
  });
});
