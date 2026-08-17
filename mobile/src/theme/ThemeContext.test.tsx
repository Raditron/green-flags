import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Pressable, Text, useColorScheme } from "react-native";
import { DARK_TOKENS, LIGHT_TOKENS } from "./tokens";
import { STORAGE_KEY, ThemeProvider, useTheme } from "./ThemeContext";

// @react-native/jest-preset already replaces react-native/Libraries/Utilities/useColorScheme
// (which `react-native`'s named export resolves to) with a jest.fn() defaulting to "light" — no
// jest.mock("react-native", ...) of our own needed (and re-requiring the whole module that way
// double-initializes native module registration and breaks the test environment).
function Consumer() {
  const { theme, tokens, toggleTheme } = useTheme();
  return (
    <>
      <Text>theme:{theme}</Text>
      <Text>bg:{tokens.bg}</Text>
      <Pressable onPress={toggleTheme} accessibilityRole="button" accessibilityLabel="toggle">
        <Text>toggle</Text>
      </Pressable>
    </>
  );
}

// RNTL v14's `render` is async (it wraps the initial render in `act`) — every call site must
// await it before the `screen` singleton is populated (see RootNavigator.test.tsx).
function renderConsumer() {
  return render(
    <ThemeProvider>
      <Consumer />
    </ThemeProvider>,
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
  (useColorScheme as jest.Mock).mockReturnValue("light");
});

describe("ThemeProvider", () => {
  it("resolves to the OS preference when there is no stored explicit choice", async () => {
    (useColorScheme as jest.Mock).mockReturnValue("dark");

    await renderConsumer();

    expect(await screen.findByText("theme:dark")).toBeOnTheScreen();
    expect(screen.getByText(`bg:${DARK_TOKENS.bg}`)).toBeOnTheScreen();
  });

  it("toggleTheme flips the resolved theme and its tokens", async () => {
    (useColorScheme as jest.Mock).mockReturnValue("light");
    await renderConsumer();

    expect(await screen.findByText("theme:light")).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText("toggle"));

    expect(screen.getByText("theme:dark")).toBeOnTheScreen();
    expect(screen.getByText(`bg:${DARK_TOKENS.bg}`)).toBeOnTheScreen();
  });

  it("persists the explicit choice to AsyncStorage on toggle", async () => {
    await renderConsumer();
    await screen.findByText("theme:light");

    await fireEvent.press(screen.getByLabelText("toggle"));

    expect(await AsyncStorage.getItem(STORAGE_KEY)).toBe("dark");
  });

  it("loads a persisted explicit choice on mount, overriding the OS preference", async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "light");
    (useColorScheme as jest.Mock).mockReturnValue("dark");

    await renderConsumer();

    // Starts from the OS preference synchronously, then flips once the async AsyncStorage read
    // resolves — see the comment in ThemeContext.tsx on why there's no way to avoid this on RN.
    expect(await screen.findByText("theme:light")).toBeOnTheScreen();
    expect(screen.getByText(`bg:${LIGHT_TOKENS.bg}`)).toBeOnTheScreen();
  });

  it("throws when useTheme is called outside a ThemeProvider", async () => {
    function Bare() {
      useTheme();
      return null;
    }
    await expect(render(<Bare />)).rejects.toThrow("useTheme must be used within a ThemeProvider");
  });
});
