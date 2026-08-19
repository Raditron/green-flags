import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { press } from "../test/press";
import { TEST_SAFE_AREA_METRICS } from "../test/safeAreaMetrics";
import { ThemeProvider } from "../theme/ThemeContext";
import { RootNavigator } from "./RootNavigator";

// The Today tab now renders a real Dashboard (#95) that fetches on mount — stub its data layer so
// this navigation-focused test never issues a real network request, mirroring how the rest of the
// suite mocks a screen's data/auth dependencies rather than letting them hit the network.
jest.mock("../components/Dashboard/data/fetchDailySummary", () => ({
  fetchDailySummary: jest.fn(async () => ({
    date: "2026-08-18",
    averageAttributesBySea: { sampleSize: 0, beachCount: 0 },
    averageAttributesByArea: [],
  })),
}));

let mockAuthValue: { user: { email: string } | null; loading: boolean };

// Mirrors the auth component-test seam used throughout the auth module (EmailVerificationBanner,
// AccountControl, UserMenu): mock AuthContext wholesale rather than the network. RootNavigator
// only reads user/loading (to gate the Saved tab), so the mock supplies just those fields.
jest.mock("../auth/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));

function renderApp() {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — every call site must
  // await it before the `screen` singleton is populated.
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("RootNavigator", () => {
  it("renders the bottom tab bar with Today, Beaches, and Saved when signed in", async () => {
    mockAuthValue = { user: { email: "diver@example.com" }, loading: false };
    await renderApp();

    // NavigationContainer resolves its initial state asynchronously (even with no linking
    // config), so the tab bar isn't necessarily present the instant `render` resolves. Queried by
    // the tab button's own accessibility label rather than plain text: the Today tab's own screen
    // (#95's Dashboard) also renders a "Today" heading, so an unscoped `findByText("Today")` would
    // match both it and the tab bar's label.
    expect(await screen.findByLabelText(/^Today, tab/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Beaches, tab/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Saved, tab/)).toBeOnTheScreen();
  });

  it("hides the Saved tab when signed out — there's no saved-beach list for a user we can't identify", async () => {
    mockAuthValue = { user: null, loading: false };
    await renderApp();

    expect(await screen.findByLabelText(/^Today, tab/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Beaches, tab/)).toBeOnTheScreen();
    expect(screen.queryByLabelText(/^Saved, tab/)).toBeNull();
  });

  it("hides the Saved tab while auth state is still loading, mirroring frontend's Layout gating", async () => {
    mockAuthValue = { user: null, loading: true };
    await renderApp();

    expect(await screen.findByLabelText(/^Today, tab/)).toBeOnTheScreen();
    expect(screen.queryByLabelText(/^Saved, tab/)).toBeNull();
  });

  it("pushes Beach Detail from the Beaches tab, and back returns to the tab", async () => {
    mockAuthValue = { user: { email: "diver@example.com" }, loading: false };
    await renderApp();

    await press(await screen.findByText("Beaches"));
    await press(await screen.findByText("Placeholder beach"));

    expect(await screen.findByText("placeholder-beach")).toBeOnTheScreen();

    await press(screen.getByLabelText("Go back"));

    expect(await screen.findByText("Placeholder beach")).toBeOnTheScreen();
  });
});
