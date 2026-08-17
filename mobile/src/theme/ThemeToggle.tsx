import { Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "./ThemeContext";

/**
 * The in-app light/dark switch (#93's "explicit in-app theme switch"). Frontend's equivalent
 * (`Layout/Theme/ThemeToggle.tsx`) lives in the header, sized/styled after `UserMenu`'s circular
 * icon chip; mobile has no header chrome yet (the tab/stack navigators run with `headerShown:
 * false` — see `RootNavigator.tsx`), so this renders as a floating chip fixed to the top-right
 * corner of every screen instead, mirroring the same 36px circular `iconChip`/`iconChipFg`
 * treatment. Rendered once at the app root (`App.tsx`) rather than per-screen.
 */
export function ThemeToggle() {
  const { theme, tokens, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${nextTheme} theme`}
      accessibilityState={{ selected: theme === "dark" }}
      hitSlop={8}
      style={[
        styles.button,
        {
          top: insets.top + 8,
          right: 16,
          backgroundColor: tokens.iconChip,
        },
      ]}
    >
      {/* Shows the glyph of the theme a press would switch *to*, matching frontend's
          sun/moon-swap behavior — a preview of the action, not the current state. */}
      <Text style={[styles.glyph, { color: tokens.iconChipFg }]}>{theme === "dark" ? "☀" : "☾"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  glyph: {
    fontSize: 16,
    lineHeight: 18,
  },
});
