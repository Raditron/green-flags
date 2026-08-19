import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { TEST_SAFE_AREA_METRICS } from "../../test/safeAreaMetrics";
import { ThemeProvider } from "../../theme/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";

function renderToggle() {
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
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
