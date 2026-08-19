import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

/**
 * The in-app light/dark switch (#93's "explicit in-app theme switch"). Frontend's equivalent
 * (`Layout/Theme/ThemeToggle.tsx`) lives in the header, sized/styled after `UserMenu`'s circular
 * icon chip; this now sits in the same spot, rendered inside TopBar (`components/Layout/
 * TopBar.tsx`) which supplies the header bar chrome (background/border/safe-area padding) around
 * it, mirroring the same 36px circular `iconChip`/`iconChipFg` treatment as before — just without
 * the absolute-position/insets math that used to fix this to a screen corner on its own.
 */
export function ThemeToggle() {
  const { theme, tokens, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${nextTheme} theme`}
      accessibilityState={{ selected: theme === "dark" }}
      hitSlop={8}
      style={[styles.button, { backgroundColor: tokens.iconChip }]}
    >
      {/* Shows the glyph of the theme a press would switch *to*, matching frontend's
          sun/moon-swap behavior — a preview of the action, not the current state. */}
      <Text style={[styles.glyph, { color: tokens.iconChipFg }]}>{theme === "dark" ? "☀" : "☾"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: {
    fontSize: 16,
    lineHeight: 18,
  },
});
