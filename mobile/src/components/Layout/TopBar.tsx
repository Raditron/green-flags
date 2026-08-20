import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AccountControl } from "./AccountControl";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../../theme/ThemeContext";
import { getTopBarStyles } from "./styles/TopBar.styles";

/**
 * RN port of frontend's `Layout.tsx` header bar (`Layout.styles.ts`'s `header`/`headerRowTop`) —
 * the surface-colored, border-bottomed strip housing the wordmark, greeting, and theme/account
 * controls. Frontend's version also carries the nav pills in this same row; mobile has none (nav
 * is the bottom tab bar instead — see `RootNavigator.tsx`), so this carries frontend's `titleBlock`
 * half (the "Green Flags" wordmark only — no separate greeting slot within it, see
 * `AccountControl`'s doc comment for where the greeting still lives) plus its `rightGroup` half:
 * `AccountControl`'s greeting/UserMenu-or-Sign-in, and `ThemeToggle`. The wordmark icon is
 * `FontAwesome6`'s `flag`, matching frontend's `react-icons/fa6` `FaFlag` one-for-one.
 *
 * Replaces what used to be two independently floating, background-less chips (`AccountControl` and
 * `ThemeToggle` each self-positioned via `useSafeAreaInsets()`, drifting over screen content with no
 * chrome behind them) with one shared bar that owns the safe-area top inset and the surface/border
 * background both children now render inside, matching frontend's header instead of looking like an
 * afterthought floating on top of it. Rendered once at the app root (`App.tsx`), in normal flex flow
 * above `EmailVerificationBanner`/`RootNavigator` — same ordering as frontend's `Layout.tsx`.
 */
export function TopBar() {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getTopBarStyles(tokens);

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 12 }]}>
      <View style={styles.titleBlock}>
        {/* Same icon as frontend's FaFlag (react-icons/fa6) — see frontend Layout.tsx. */}
        <FontAwesome6 name="flag" solid size={14} color={tokens.flagGreen} />
        <Text style={[styles.title, { color: tokens.flagGreen }]}>Green Flags</Text>
      </View>

      <View style={styles.rightGroup}>
        <AccountControl />
        <ThemeToggle />
      </View>
    </View>
  );
}
