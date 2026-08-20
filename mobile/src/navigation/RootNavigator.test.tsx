import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { press } from "../test/press";
import { TEST_SAFE_AREA_METRICS } from "../test/safeAreaMetrics";
import { ThemeProvider } from "../theme/ThemeContext";
import { ToastProvider } from "../toast/ToastContext";
import { SavedBeachesProvider } from "../saved/SavedBeachesContext";
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

// The Beaches tab now renders a real BeachList (#96) that also fetches on mount and reads device
// location — stub both data dependencies for the same reason as fetchDailySummary above.
// useUserLocation is stubbed rather than expo-location directly (mirroring how BeachList.test.tsx
// mocks it too), settling straight to "unavailable" so this navigation-focused test never depends
// on geolocation resolving.
jest.mock("../components/BeachList/data/fetchBeaches", () => ({
  fetchBeaches: jest.fn(async () => ({
    beaches: [
      {
        id: "placeholder-beach",
        name: "Placeholder beach",
        lat: 43.2,
        long: 27.9,
        area: "Varna",
        isUnguarded: false,
      },
    ],
  })),
}));

jest.mock("../shared/hooks/useUserLocation", () => ({
  useUserLocation: () => ({ status: "unavailable" }),
}));

// Beach Detail (#97) now renders for real too, fetching its own predictions on mount — stub it
// for the same reason as fetchDailySummary/fetchBeaches above, this being a navigation-focused
// test rather than one that should ever need to settle a real (or even mocked-resolved) fetch.
jest.mock("../components/BeachDetail/data/fetchPredictions", () => ({
  fetchPredictions: jest.fn(() => new Promise(() => {})),
}));

// The Saved tab (#100) now renders a real SavedBeaches too, which would fetch the signed-in
// visitor's saved beaches on mount if its tab were ever pressed — stub it for the same reason as
// the data mocks above. (bottom-tabs' default `lazy` mounting means none of the current tests
// actually trigger this, but the stub is here so a future test that does press into Saved stays
// navigation-focused rather than depending on the network.)
jest.mock("../saved/data/fetchSavedBeaches", () => ({
  fetchSavedBeaches: jest.fn(async () => []),
}));

let mockAuthValue: { user: { email: string } | null; loading: boolean };

// Mirrors the auth component-test seam used throughout the auth module (EmailVerificationBanner,
// AccountControl, UserMenu): mock AuthContext wholesale rather than the network.
jest.mock("../auth/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));

function renderApp() {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — every call site must
  // await it before the `screen` singleton is populated.
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>
        {/* Real SavedBeachesProvider (#100), same nesting as App.tsx — its own fetch is stubbed
            above, so this is safe to leave un-mocked and exercises the real save/unsave wiring
            SaveBeachButton (on Beach Detail) and the Saved tab both read through. */}
        <SavedBeachesProvider>
          {/* BeachDetail (#97) shows a disclaimer toast on mount via useToast() — mirrors App.tsx's
              real provider ordering (ToastProvider inside ThemeProvider) so that doesn't throw. */}
          <ToastProvider>
            <RootNavigator />
          </ToastProvider>
        </SavedBeachesProvider>
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

  it("still shows the Saved tab when signed out — SavedBeaches itself prompts to sign in (#100)", async () => {
    mockAuthValue = { user: null, loading: false };
    await renderApp();

    expect(await screen.findByLabelText(/^Today, tab/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Beaches, tab/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Saved, tab/)).toBeOnTheScreen();
  });

  it("still shows the Saved tab while auth state is still loading", async () => {
    mockAuthValue = { user: null, loading: true };
    await renderApp();

    expect(await screen.findByLabelText(/^Today, tab/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Saved, tab/)).toBeOnTheScreen();
  });

  it("pressing the Saved tab while signed out shows a sign-in prompt, not a crash or an empty grid", async () => {
    mockAuthValue = { user: null, loading: false };
    await renderApp();

    await press(await screen.findByText("Saved"));

    expect(await screen.findByText("Sign in to see your saved beaches")).toBeOnTheScreen();
  });

  it("pushes Beach Detail from the Beaches tab, and back returns to the tab", async () => {
    mockAuthValue = { user: { email: "diver@example.com" }, loading: false };
    await renderApp();

    await press(await screen.findByText("Beaches"));
    await press(await screen.findByText("Placeholder beach"));

    expect(await screen.findByLabelText("Beach detail")).toBeOnTheScreen();

    await press(screen.getByLabelText("Go back"));

    expect(await screen.findByText("Placeholder beach")).toBeOnTheScreen();
  });
});
