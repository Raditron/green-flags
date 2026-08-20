import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

/**
 * The in-app light/dark switch (#93's "explicit in-app theme switch"). Frontend's equivalent
 * (`Layout/Theme/ThemeToggle.tsx`) lives in the header, sized/styled after `UserMenu`'s circular
 * icon chip; this now sits in the same spot, rendered inside TopBar (`components/Layout/
 * TopBar.tsx`) which supplies the header bar chrome (background/border/safe-area padding) around
 * it, mirroring the same 36px circular `iconChip`/`iconChipFg` treatment as before — just without
 * the absolute-position/insets math that used to fix this to a screen corner on its own. Frontend's
 * `ThemeToggle.tsx` uses inline SVG with no `react-icons/fa6` equivalent to crib from, so this uses
 * FontAwesome6's `sun`/`moon` for icon-system consistency with the rest of mobile instead.
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
      <FontAwesome6 name={theme === "dark" ? "sun" : "moon"} solid size={16} color={tokens.iconChipFg} />
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
});
