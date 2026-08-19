import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text } from "react-native";
import { BEACH_AREAS } from "../../../../shared/types/Beach";
import { useTheme } from "../../../../theme/ThemeContext";
import type { SelectedArea } from "../../hooks/useBeachFilters";
import type { AreaSelectProps } from "./interfaces";
import { getAreaSelectStyles } from "./styles/AreaSelect.styles";

const ALL_AREAS_LABEL = "All Areas";
const AREA_OPTIONS: SelectedArea[] = ["all", ...BEACH_AREAS];

function areaLabel(area: SelectedArea): string {
  return area === "all" ? ALL_AREAS_LABEL : area;
}

/**
 * RN port of frontend's AreaSelect/AreaSelect.tsx — same option set (All Areas + every
 * BeachArea) and the same `SelectedArea` value/onChange contract, but presented as a Pressable
 * trigger that opens a bottom-sheet-style `<Modal>` instead of frontend's FieldSelect dropdown:
 * mobile has no select/picker library installed (see AuthScreen.tsx's Modal precedent).
 */
export function AreaSelect({ value, onChange }: AreaSelectProps) {
  const { tokens } = useTheme();
  const styles = getAreaSelectStyles(tokens);
  const [isOpen, setIsOpen] = useState(false);

  function handleSelect(area: SelectedArea) {
    onChange(area);
    setIsOpen(false);
  }

  return (
    <>
      <Pressable
        style={styles.trigger}
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Filter by area"
      >
        <Text style={styles.triggerText}>{areaLabel(value)}</Text>
        {/* Was a plain "▾" Unicode glyph, but that character is missing from some device/emulator
            fonts and renders as an invisible tofu box. FontAwesome6 (already used elsewhere in
            this file's parent — see BeachListFilters.tsx) guarantees the glyph actually renders. */}
        <FontAwesome6 name="chevron-down" size={11} color={tokens.text} style={{ opacity: 0.7 }} />
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          {/* Empty onPress claims the touch responder so a tap inside the sheet doesn't bubble up
              to the backdrop's onPress and close it — same pattern as AuthScreen.tsx's card. */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Area</Text>
            {/* A plain map over a ScrollView, not FlatList — the option list is a fixed ~14 items
                (Area count doesn't grow at runtime), too short to need virtualization, and
                FlatList's windowed rendering (only `initialNumToRender` items mount up front)
                would otherwise hide later options like Burgas/Sozopol from both visitors
                scrolling fast and RNTL queries in tests. */}
            <ScrollView>
              {AREA_OPTIONS.map((area) => (
                <Pressable
                  key={area}
                  style={styles.option}
                  onPress={() => handleSelect(area)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: area === value }}
                >
                  <Text style={area === value ? styles.optionTextSelected : styles.optionText}>
                    {areaLabel(area)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
