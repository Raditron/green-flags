import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../../../theme/ThemeContext";
import { flagColorFor } from "../../../../shared/styles/flagColor";
import type { FlagColor } from "../../../../shared/types/Beach";
import { getFlagOptionStyle, getReportPromptStyles } from "./styles/ReportPrompt.styles";

const OPTIONS: { flagColor: FlagColor; label: string }[] = [
  { flagColor: "green", label: "Green" },
  { flagColor: "yellow", label: "Yellow" },
  { flagColor: "red", label: "Red" },
];

/**
 * RN port of frontend's ReportPrompt/ReportPrompt.tsx: three tappable flag-color options, each a
 * solid swatch + label. `pressed` (per-option, RN's Pressable render-prop) stands in for
 * frontend's mouse hover — there's no hover on a touch device, so this is the only "leaning in"
 * state a flag option gets here.
 */
export function ReportPrompt({
  submitting,
  onPick,
}: {
  submitting: boolean;
  onPick: (flagColor: FlagColor) => void;
}) {
  const { tokens } = useTheme();
  const styles = getReportPromptStyles(tokens);
  const [pressed, setPressed] = useState<FlagColor | null>(null);

  return (
    <View>
      <Text style={styles.prompt}>Think this flag is wrong? Vote below.</Text>
      <View style={styles.options}>
        {OPTIONS.map(({ flagColor, label }) => {
          const optionStyles = getFlagOptionStyle(flagColor, tokens, pressed === flagColor, submitting);
          return (
            <Pressable
              key={flagColor}
              disabled={submitting}
              onPress={() => onPick(flagColor)}
              onPressIn={() => setPressed(flagColor)}
              onPressOut={() => setPressed(null)}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ disabled: submitting }}
              style={optionStyles.option}
            >
              <View style={[styles.swatch, { backgroundColor: flagColorFor(flagColor, tokens) }]}>
                <FontAwesome6 name="flag" solid size={16} style={styles.icon} />
              </View>
              <Text style={optionStyles.label}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
