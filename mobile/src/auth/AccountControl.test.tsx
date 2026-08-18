import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { press } from "../test/press";
import { TEST_SAFE_AREA_METRICS } from "../test/safeAreaMetrics";
import { ThemeProvider } from "../theme/ThemeContext";
import { AccountControl } from "./AccountControl";

const mockLogIn = jest.fn();
const mockSignUp = jest.fn();
const mockLogOut = jest.fn();
let mockAuthValue: {
  user: { email: string; displayName: string; emailVerified: boolean } | null;
  loading: boolean;
};

// Mirrors the auth component-test seam used throughout this module (EmailVerificationBanner,
// UserMenu, AuthScreen): mock AuthContext wholesale rather than the network. AccountControl
// renders both UserMenu and AuthScreen depending on auth state, so this mock supplies every
// field either of them might read off useAuth().
jest.mock("./AuthContext", () => ({
  useAuth: () => ({
    ...mockAuthValue,
    signUp: mockSignUp,
    logIn: mockLogIn,
    logOut: mockLogOut,
  }),
}));

function renderControl() {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>
        <AccountControl />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  mockLogIn.mockReset();
  mockSignUp.mockReset();
  mockLogOut.mockReset();
});

describe("AccountControl", () => {
  it("renders nothing while auth state is loading", async () => {
    mockAuthValue = { user: null, loading: true };
    await renderControl();

    expect(screen.queryByRole("button", { name: "Sign in" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Account menu" })).toBeNull();
  });

  it("renders a Sign in trigger when signed out, opening AuthScreen on press", async () => {
    mockAuthValue = { user: null, loading: false };
    await renderControl();

    const signInButton = screen.getByRole("button", { name: "Sign in" });
    await press(signInButton);

    expect(await screen.findByText("Welcome back")).toBeOnTheScreen();
  });

  it("closes AuthScreen and returns to the Sign in trigger when dismissed", async () => {
    mockAuthValue = { user: null, loading: false };
    await renderControl();

    await press(screen.getByRole("button", { name: "Sign in" }));
    await screen.findByText("Welcome back");

    await press(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByText("Welcome back")).toBeNull();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeOnTheScreen();
  });

  it("renders UserMenu with the signed-in user's email and display name when signed in", async () => {
    mockAuthValue = {
      user: { email: "diver@example.com", displayName: "Zack", emailVerified: true },
      loading: false,
    };
    await renderControl();

    expect(screen.queryByRole("button", { name: "Sign in" })).toBeNull();
    expect(screen.getByRole("button", { name: "Account menu" })).toHaveTextContent("Z");
  });

  it("greets the signed-in user by the part of their email before the @, mirroring frontend's Layout greeting", async () => {
    mockAuthValue = {
      user: { email: "diver@example.com", displayName: "Zack", emailVerified: true },
      loading: false,
    };
    await renderControl();

    expect(screen.getByText("Hello, diver")).toBeOnTheScreen();
  });
});
