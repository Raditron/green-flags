import { fireEvent, render, screen } from "@testing-library/react-native";
import { press } from "../test/press";
import { ThemeProvider } from "../theme/ThemeContext";
import { AuthScreen } from "./AuthScreen";

const mockSignUp = jest.fn();
const mockLogIn = jest.fn();

// Mirrors the auth component-test seam established by UserMenu.test.tsx/
// EmailVerificationBanner.test.tsx: mock AuthContext wholesale rather than the network. Firebase
// call shape/ordering is already covered by auth/data/signUp.test.ts and logIn.test.ts.
jest.mock("./AuthContext", () => ({
  useAuth: () => ({ signUp: mockSignUp, logIn: mockLogIn }),
}));

function renderScreen(props: { onClose?: () => void; onAuthenticated?: () => void } = {}) {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <ThemeProvider>
      <AuthScreen onClose={props.onClose ?? jest.fn()} onAuthenticated={props.onAuthenticated} />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  mockSignUp.mockReset();
  mockLogIn.mockReset();
});

describe("AuthScreen", () => {
  it("logs in with the entered email and password in login mode, with no display name field", async () => {
    mockLogIn.mockResolvedValue(undefined);
    const onAuthenticated = jest.fn();
    await renderScreen({ onAuthenticated });

    expect(screen.queryByLabelText("Display name")).toBeNull();

    await fireEvent.changeText(screen.getByLabelText("Email"), "diver@example.com");
    await fireEvent.changeText(screen.getByLabelText("Password"), "password123");
    await press(screen.getByRole("button", { name: "Log in" }));

    expect(mockLogIn).toHaveBeenCalledWith("diver@example.com", "password123");
    expect(mockSignUp).not.toHaveBeenCalled();
    expect(onAuthenticated).toHaveBeenCalledTimes(1);
  });

  it("does not log in when the password is shorter than 6 characters", async () => {
    await renderScreen();

    await fireEvent.changeText(screen.getByLabelText("Email"), "diver@example.com");
    await fireEvent.changeText(screen.getByLabelText("Password"), "abc");
    await press(screen.getByRole("button", { name: "Log in" }));

    expect(mockLogIn).not.toHaveBeenCalled();
  });

  it("does not sign up when the display name field is left blank", async () => {
    await renderScreen();

    // A `tab`, not a `button` — the segmented mode switcher, distinct from the submit button
    // below it that reuses the same "Sign up" label.
    await press(screen.getByRole("tab", { name: "Sign up" }));
    await fireEvent.changeText(screen.getByLabelText("Email"), "diver@example.com");
    await fireEvent.changeText(screen.getByLabelText("Password"), "password123");
    await press(screen.getByRole("button", { name: "Sign up" }));

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("signs up with the entered fields, and calls onClose when onAuthenticated is omitted", async () => {
    mockSignUp.mockResolvedValue(undefined);
    const onClose = jest.fn();
    await renderScreen({ onClose });

    await press(screen.getByRole("tab", { name: "Sign up" }));
    await fireEvent.changeText(screen.getByLabelText("Display name"), "Diver Dan");
    await fireEvent.changeText(screen.getByLabelText("Email"), "diver@example.com");
    await fireEvent.changeText(screen.getByLabelText("Password"), "password123");
    await press(screen.getByRole("button", { name: "Sign up" }));

    expect(mockSignUp).toHaveBeenCalledWith("diver@example.com", "password123", "Diver Dan");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when login fails", async () => {
    mockLogIn.mockRejectedValue(new Error("bad credentials"));
    await renderScreen();

    await fireEvent.changeText(screen.getByLabelText("Email"), "diver@example.com");
    await fireEvent.changeText(screen.getByLabelText("Password"), "wrongpass");
    await press(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Invalid email or password.")).toBeOnTheScreen();
  });

  it("calls onClose when the close button is pressed", async () => {
    const onClose = jest.fn();
    await renderScreen({ onClose });

    await press(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
