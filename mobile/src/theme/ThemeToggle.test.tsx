import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { ThemeProvider } from "./ThemeContext";
import { ThemeToggle } from "./ThemeToggle";

// Matches RootNavigator.test.tsx's fixed metrics — SafeAreaProvider never resolves
// initialWindowMetrics under Jest, so ThemeToggle's useSafeAreaInsets() would hang without this.
const TEST_METRICS = {
  frame: { x: 0, y: 0, width: 320, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderToggle() {
  return render(
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  (useColorScheme as jest.Mock).mockReturnValue("light");
});

describe("ThemeToggle", () => {
  it("labels itself with the theme a press would switch to, and flips on press", async () => {
    await renderToggle();

    const button = await screen.findByLabelText("Switch to dark theme");
    expect(button).toBeOnTheScreen();

    await fireEvent.press(button);

    expect(screen.getByLabelText("Switch to light theme")).toBeOnTheScreen();
  });
});
