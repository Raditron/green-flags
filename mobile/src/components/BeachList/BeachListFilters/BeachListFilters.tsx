import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import type { FlagColor } from "../../../shared/types/Beach";
import { AreaSelect } from "./AreaSelect/AreaSelect";
import type { BeachListFiltersProps } from "./interfaces";
import {
  getBeachListFiltersStyles,
  getFlagChipStyle,
  getFlagChipTextStyle,
} from "./styles/BeachListFilters.styles";

const FLAG_OPTIONS: { flagColor: FlagColor; label: string }[] = [
  { flagColor: "green", label: "Green" },
  { flagColor: "yellow", label: "Yellow" },
  { flagColor: "red", label: "Red" },
];

/**
 * RN port of frontend's BeachListFilters: search box, Area picker (plus a "Near you" hint while
 * the Area came from Detected Area rather than a manual pick), and a flag-color filter. Diverges
 * from frontend in the two ways #96's acceptance criteria calls for: the flag filter is
 * single-select — tapping a chip either selects it or, if already selected, clears back to no
 * flag filter, rather than frontend's independent multi-toggle chips — and there's no
 * GuardedSelect (the guarded/unguarded filter isn't part of #96's scope).
 */
export function BeachListFilters({
  searchQuery,
  onSearchChange,
  selectedFlag,
  onSelectFlag,
  selectedArea,
  onAreaChange,
  isAreaAutoDetected,
  onClearFilters,
}: BeachListFiltersProps) {
  const { tokens } = useTheme();
  const styles = getBeachListFiltersStyles(tokens);

  function handleFlagPress(flagColor: FlagColor) {
    onSelectFlag(selectedFlag === flagColor ? null : flagColor);
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchClearContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search beaches by name…"
          placeholderTextColor={tokens.text}
          accessibilityLabel="Search beaches by name"
          style={styles.searchInput}
        />

        <Pressable
          onPress={onClearFilters}
          accessibilityRole="button"
          accessibilityLabel="Clear filters"
          style={styles.clearFiltersButton}
        >
          {/* Same icon as frontend's FaFilterCircleXmark (react-icons/fa6) — @expo/vector-icons'
              FontAwesome6 set ships the identical glyph, so this is true parity rather than a
              Unicode stand-in. `solid` matches react-icons/fa6's Fa-prefixed (solid) style. */}
          <FontAwesome6
            name="filter-circle-xmark"
            solid
            size={14}
            color={tokens.text}
          />
        </Pressable>
      </View>
      {/* Area picker, flag chips, and Clear filters share one wrapping row instead of each getting
          its own line — they're all compact controls, so stacking them one-per-row (as separate
          `View`s would) wastes vertical space and reads oddly on a phone screen. */}
      <View style={styles.filtersRow}>
        <View style={styles.areaRow}>
          <AreaSelect value={selectedArea} onChange={onAreaChange} />
          {isAreaAutoDetected && (
            <View style={styles.areaHint}>
              {/* Same icon as frontend's FaLocationDot (react-icons/fa6) — @expo/vector-icons'
                  FontAwesome6 set ships the identical glyph. `solid` matches react-icons/fa6's
                  Fa-prefixed (solid) style. */}
              <FontAwesome6
                name="location-dot"
                solid
                size={11}
                color={tokens.info}
              />
              <Text style={styles.areaHintText}>Near you</Text>
            </View>
          )}
        </View>

        <View
          style={styles.flagRow}
          role="radiogroup"
          accessibilityLabel="Filter by flag color"
        >
          {FLAG_OPTIONS.map(({ flagColor, label }) => {
            const isSelected = selectedFlag === flagColor;
            return (
              <Pressable
                key={flagColor}
                style={getFlagChipStyle(tokens, flagColor, isSelected)}
                onPress={() => handleFlagPress(flagColor)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${label} flag`}
              >
                <Text
                  style={getFlagChipTextStyle(tokens, flagColor, isSelected)}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
