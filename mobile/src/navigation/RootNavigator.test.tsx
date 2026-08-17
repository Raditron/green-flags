import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../theme/ThemeContext";
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
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

// RNTL's `fireEvent.press` is async under the hood (it always wraps in an async function
// internally, even for a synchronous callback) — every call site must be awaited, or the next
// statement runs before the state update/navigation transition it triggered has actually landed.
// See ToastContext.test.tsx for the same pattern.
async function press(element: Awaited<ReturnType<typeof screen.findByText>>) {
  await fireEvent.press(element);
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
