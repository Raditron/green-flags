import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./RootNavigator";

// react-native-safe-area-context has no native module under Jest, so `initialWindowMetrics` is
// `null` — passing that as `initialMetrics` leaves SafeAreaProvider waiting forever for an
// onLayout measurement that never arrives in the test renderer, and it never renders its
// children. Supply fixed metrics instead (the pattern documented by the library's own test
// helpers) so the tree renders synchronously.
const TEST_METRICS = {
  frame: { x: 0, y: 0, width: 320, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderApp() {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — every call site must
  // await it before the `screen` singleton is populated.
  return render(
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <RootNavigator />
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

    fireEvent.press(await screen.findByText("Beaches"));
    fireEvent.press(await screen.findByText("Placeholder beach"));

    expect(await screen.findByText("placeholder-beach")).toBeOnTheScreen();

    fireEvent.press(screen.getByLabelText("Go back"));

    expect(await screen.findByText("Placeholder beach")).toBeOnTheScreen();
  });
});
