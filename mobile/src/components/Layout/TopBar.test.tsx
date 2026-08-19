import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TEST_SAFE_AREA_METRICS } from "../../test/safeAreaMetrics";
import { ThemeProvider } from "../../theme/ThemeContext";
import { TopBar } from "./TopBar";

let mockAuthValue: {
  user: { email: string; displayName: string; emailVerified: boolean } | null;
  loading: boolean;
};

// Mirrors the auth component-test seam used throughout this module (see AccountControl.test.tsx) —
// TopBar renders AccountControl, which reads useAuth() directly.
jest.mock("../../auth/AuthContext", () => ({
  useAuth: () => ({
    ...mockAuthValue,
    signUp: jest.fn(),
    logIn: jest.fn(),
    logOut: jest.fn(),
  }),
}));

function renderTopBar() {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>
        <TopBar />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("TopBar", () => {
  it("renders the Green Flags wordmark alongside the signed-out AccountControl content and ThemeToggle", async () => {
    mockAuthValue = { user: null, loading: false };
    await renderTopBar();

    expect(screen.getByText("Green Flags")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeOnTheScreen();
    expect(screen.getByLabelText("Switch to dark theme")).toBeOnTheScreen();
  });

  it("renders the signed-in greeting and account menu alongside ThemeToggle", async () => {
    mockAuthValue = {
      user: { email: "diver@example.com", displayName: "Zack", emailVerified: true },
      loading: false,
    };
    await renderTopBar();

    expect(screen.getByText("Hello, diver")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Account menu" })).toBeOnTheScreen();
    expect(screen.getByLabelText("Switch to dark theme")).toBeOnTheScreen();
  });
});
