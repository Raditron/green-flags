import { StyleSheet } from "react-native";
import type { ThemeTokens } from "../../../theme/tokens";

// RN port of frontend/src/components/Dashboard/styles/Dashboard.styles.ts. Mobile has no header
// chrome — ThemeToggle/AccountControl instead float as absolutely-positioned chips over the top
// of every screen (see their own doc comments) — so `scrollContent` reserves headroom for them
// (chip height 36 + their 8px top offset + a little breathing room) on top of the safe-area inset
// itself, which frontend's header-based layout never had to think about.
const CHIP_CLEARANCE = 56;

export function getDashboardStyles(tokens: ThemeTokens, { insetsTop }: { insetsTop: number }) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.bg,
    },
    scrollContent: {
      paddingTop: insetsTop + CHIP_CLEARANCE,
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
