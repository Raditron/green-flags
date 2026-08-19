import { StyleSheet } from "react-native";
import type { ThemeTokens } from "../../../theme/tokens";

// RN port of frontend/src/components/BeachList/styles/BeachList.styles.ts's error/empty
// treatment, plus the title/message styles Dashboard.styles.ts's screen-level pattern uses (this
// screen renders its own "Beaches" heading, same as Dashboard's "Today" — TopBar only carries the
// app-wide wordmark, not per-screen titles).
export function getBeachListStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.bg,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: tokens.textHeading,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    message: {
      fontSize: 15,
      color: tokens.text,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    error: {
      fontSize: 15,
      color: tokens.error,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    empty: {
      fontSize: 15,
      color: tokens.text,
      paddingHorizontal: 16,
      marginTop: 12,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    separator: {
      height: 10,
    },
  });
}
