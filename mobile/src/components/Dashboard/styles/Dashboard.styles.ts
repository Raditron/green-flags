import { StyleSheet } from "react-native";
import type { ThemeTokens } from "../../../theme/tokens";

// RN port of frontend/src/components/Dashboard/styles/Dashboard.styles.ts. Mobile used to reserve
// extra `scrollContent` headroom here for ThemeToggle/AccountControl, which floated as
// absolutely-positioned chips over the top of every screen with no chrome behind them. They now
// render inside `TopBar` (`components/Layout/TopBar.tsx`), which sits in normal flex flow above
// this screen and owns the safe-area top inset itself — so, like frontend's header-based layout,
// this has nothing left to compensate for.

export function getDashboardStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.bg,
    },
    scrollContent: {
      paddingTop: 16,
      paddingHorizontal: 16,
      paddingBottom: 32,
      width: "100%",
      maxWidth: 1100,
      alignSelf: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: tokens.textHeading,
      marginBottom: 16,
    },
    message: {
      fontSize: 15,
      color: tokens.text,
    },
    error: {
      fontSize: 15,
      color: tokens.error,
    },
    empty: {
      fontSize: 15,
      color: tokens.text,
      marginTop: 24,
    },
  });
}
