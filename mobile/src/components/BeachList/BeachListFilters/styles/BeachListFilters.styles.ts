import { StyleSheet } from "react-native";
import type { TextStyle, ViewStyle } from "react-native";
import { flagColorFor } from "../../../../shared/styles/flagColor";
import type { ThemeTokens } from "../../../../theme/tokens";
import type { FlagColor } from "../../../../shared/types/Beach";

// RN port of frontend/src/components/BeachList/BeachListFilters/styles/BeachListFilters.styles.ts.
// Drops guardedRow (no GuardedSelect — see BeachListFilters.tsx's doc comment) and the
// search-icon-in-input treatment (no absolutely-positioned icon-in-TextInput idiom in RN). Some
// other icons here are still plain Unicode glyphs (⚑, ☈, …) rather than a font icon; Clear
// filters and AreaSelect's chevron pull their icons from @expo/vector-icons instead — for Clear
// filters that's for exact parity with frontend's react-icons/fa6 (see BeachListFilters.tsx's
// comment above that Pressable), and for the chevron it's because the plain "▾" glyph doesn't
// render on some device fonts (see AreaSelect.tsx's comment above it).
export function getBeachListFiltersStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    searchClearContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    container: {
      flexDirection: "column",
      gap: 10,
      paddingBottom: 10,
      paddingTop:10,
    },
    searchInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: tokens.border,
      borderRadius: 999,
      paddingVertical: 9,
      paddingHorizontal: 14,
      fontSize: 15,
      color: tokens.text,
      backgroundColor: tokens.surface,
    },
    // Lets the area picker, flag chips, and Clear filters share a row, wrapping together onto a
    // second line only if the device is too narrow to fit all three — see BeachListFilters.tsx's
    // comment above it.
    filtersRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 10,
      justifyContent:'space-between',
    },
    areaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex:1,
      display:'flex',
    },
    // Confirms the Area was picked for the visitor rather than by them — matches frontend's
    // areaHint (neutralHintTextStyle) shown only while isAreaAutoDetected.
    areaHint: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    areaHintText: {
      fontSize: 12,
      fontWeight: "600",
      color: tokens.info,
    },
    flagRow: {
      flexDirection: "row",
      gap: 8,
    },
    // RN port of frontend's ClearFilters pill (border + surface fill, so it reads as one more
    // control in the row rather than a stray text link) minus the isHovered border-color swap —
    // RN Pressable has no hover state to key off of on a touch device — and minus the "Clear
    // filters" label: the Area picker + 3 flag chips already fill a phone-width row on their own,
    // so keeping this an icon-only circle (label lives on in accessibilityLabel) is what lets it
    // sit on that same row instead of always wrapping to its own line.
    clearFiltersButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      borderWidth: 1,
      borderColor: tokens.border,
      backgroundColor: tokens.surface,
    },
  });
}

// Unselected chips stay outlined in the flag's own color so the option reads at a glance;
// selecting one fills it — same treatment as frontend's getFlagFilterChipStyle, minus the icon
// (mobile shows the color name as text instead of a flag glyph per chip).
export function getFlagChipStyle(tokens: ThemeTokens, flagColor: FlagColor, isSelected: boolean): ViewStyle {
  const flagVar = flagColorFor(flagColor, tokens);
  return {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: flagVar,
    backgroundColor: isSelected ? flagVar : "transparent",
  };
}

export function getFlagChipTextStyle(tokens: ThemeTokens, flagColor: FlagColor, isSelected: boolean): TextStyle {
  const flagVar = flagColorFor(flagColor, tokens);
  return {
    fontSize: 13,
    fontWeight: "700",
    color: isSelected ? tokens.mediaBadgeFg : flagVar,
  };
}
