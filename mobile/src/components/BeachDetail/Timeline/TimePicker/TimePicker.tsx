import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "../../../../theme/ThemeContext";
import { flagColorFor } from "../../../../shared/styles/flagColor";
import type { TimePickerProps } from "./interfaces";
import { getTimePickerStyles, getTimePickerRowStyle } from "./styles/TimePicker.styles";

// RN port of frontend's Timeline/TimePicker/TimePicker.tsx: a modal dialog (RN's `Modal` in place
// of frontend's fixed-position backdrop + dialog div) listing every hour of the day, so a visitor
// can jump the Timeline off "now" to any other hour.
export function TimePicker({ hourlyPredictions, selectedHour, currentHour, onPick, onClose }: TimePickerProps) {
  const { tokens } = useTheme();
  const styles = getTimePickerStyles(tokens);

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Swallows the press so tapping inside the dialog itself doesn't bubble to the backdrop
            and close it — mirrors frontend's event.stopPropagation(). */}
        <Pressable
          style={styles.picker}
          onPress={(event) => event.stopPropagation()}
          role="dialog"
          aria-label="Select prediction hour"
        >
          <Text style={styles.prompt}>Choose a prediction hour</Text>

          <ScrollView style={styles.list}>
            {hourlyPredictions.map((prediction) => {
              const isSelected = prediction.hour === selectedHour;
              const isCurrent = prediction.hour === currentHour;
              return (
                <Pressable
                  key={prediction.hour}
                  style={getTimePickerRowStyle(tokens, { selected: isSelected })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onPick(prediction.hour)}
                >
                  <View style={[styles.dot, { backgroundColor: flagColorFor(prediction.flagColor, tokens) }]} />
                  <Text style={styles.hourLabel}>{String(prediction.hour).padStart(2, "0")}:00</Text>
                  {isCurrent && <Text style={styles.nowTag}>Now</Text>}
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={8}
          >
            <Text style={styles.closeIcon}>×</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
