import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as firebaseAuth from "firebase/auth";
import { AuthModal } from "./AuthModal";
import { AuthProvider } from "../../../auth/AuthContext";

// First Firebase mock in this repo — no prior art to follow. The auth object and signed-up user
// are created inside the factory (rather than referencing outer test-file variables) to dodge
// vi.mock's hoisting: this factory runs before the rest of the file's top-level code does.
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock("firebase/auth", () => {
  const authObj: { currentUser: unknown } = { currentUser: null };
  const mockUser = { getIdToken: vi.fn(async () => "fake-id-token") };

  return {
    __mockAuthObj: authObj,
    __mockUser: mockUser,
    getAuth: vi.fn(() => authObj),
    onAuthStateChanged: vi.fn((_auth: unknown, callback: (user: unknown) => void) => {
      callback(authObj.currentUser);
      return () => {};
    }),
    createUserWithEmailAndPassword: vi.fn(async () => {
      authObj.currentUser = mockUser;
      return { user: mockUser };
    }),
    updateProfile: vi.fn(async () => {}),
    sendEmailVerification: vi.fn(async () => {}),
    signInWithEmailAndPassword: vi.fn(async () => {}),
    signOut: vi.fn(async () => {}),
  };
});

// The mocked module's internal state — cast through unknown since these fields aren't part of
// the real firebase/auth type surface.
const mockAuthObj = (firebaseAuth as unknown as { __mockAuthObj: { currentUser: unknown } }).__mockAuthObj;
const mockUser = (firebaseAuth as unknown as { __mockUser: { getIdToken: ReturnType<typeof vi.fn> } }).__mockUser;

function renderSignupModal() {
  render(
    <AuthProvider>
      <AuthModal onClose={() => {}} />
    </AuthProvider>,
  );
  return userEvent.setup();
}

async function switchToSignup(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText("Need an account? Sign up"));
}

describe("AuthModal", () => {
  beforeEach(() => {
    mockAuthObj.currentUser = null;
    mockUser.getIdToken.mockClear();
    vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockClear();
    vi.mocked(firebaseAuth.updateProfile).mockClear();
    vi.mocked(firebaseAuth.sendEmailVerification).mockClear();
  });

  it("does not call createUserWithEmailAndPassword when the display name field is left blank", async () => {
    const user = renderSignupModal();
    await switchToSignup(user);

    await user.type(screen.getByLabelText("Email"), "diver@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(firebaseAuth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("calls createUserWithEmailAndPassword, updateProfile, getIdToken(true), and sendEmailVerification in order", async () => {
    const user = renderSignupModal();
    await switchToSignup(user);

    await user.type(screen.getByLabelText("Display name"), "Diver Dan");
    await user.type(screen.getByLabelText("Email"), "diver@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => expect(firebaseAuth.sendEmailVerification).toHaveBeenCalled());

    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "diver@example.com",
      "password123",
    );
    expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(mockUser, { displayName: "Diver Dan" });
    expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
    expect(firebaseAuth.sendEmailVerification).toHaveBeenCalledWith(mockUser);

    const callOrder = [
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mock.invocationCallOrder[0],
      vi.mocked(firebaseAuth.updateProfile).mock.invocationCallOrder[0],
      mockUser.getIdToken.mock.invocationCallOrder[0],
      vi.mocked(firebaseAuth.sendEmailVerification).mock.invocationCallOrder[0],
    ];
    expect(callOrder).toEqual([...callOrder].sort((a, b) => a - b));
  });

  it("leaves login mode unaffected — no display name field, and logIn is called on submit", async () => {
    const user = renderSignupModal();

    expect(screen.queryByLabelText("Display name")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Email"), "diver@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalled());
    expect(firebaseAuth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });
});
