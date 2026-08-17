import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { press } from "../test/press";
import { TEST_SAFE_AREA_METRICS } from "../test/safeAreaMetrics";
import { ThemeProvider } from "../theme/ThemeContext";
import { RootNavigator } from "./RootNavigator";

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
  it("renders the bottom tab bar with Today, Beaches, and Saved", async () => {
    await renderApp();

    // NavigationContainer resolves its initial state asynchronously (even with no linking
    // config), so the tab bar isn't necessarily present the instant `render` resolves.
    expect(await screen.findByText("Today")).toBeOnTheScreen();
    expect(screen.getByText("Beaches")).toBeOnTheScreen();
    expect(screen.getByText("Saved")).toBeOnTheScreen();
  });

  it("pushes Beach Detail from the Beaches tab, and back returns to the tab", async () => {
    await renderApp();

    await press(await screen.findByText("Beaches"));
    await press(await screen.findByText("Placeholder beach"));

    expect(await screen.findByText("placeholder-beach")).toBeOnTheScreen();

    await press(screen.getByLabelText("Go back"));

    expect(await screen.findByText("Placeholder beach")).toBeOnTheScreen();
  });
});
