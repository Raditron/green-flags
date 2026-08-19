import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Text, View } from "react-native";
import { useTheme } from "../../../../theme/ThemeContext";
import { getUnguardedNoticeStyles } from "./styles/UnguardedNotice.styles";

// RN port of frontend's Timeline/UnguardedNotice/UnguardedNotice.tsx. Rendered under Verdict's
// flag-color panel (see Timeline.tsx) only for unguarded beaches — the flag reading above answers
// "what are conditions doing", this answers "is anyone watching", which matters just as much for
// an unguarded beach.
export function UnguardedNotice() {
  const { tokens } = useTheme();
  const styles = getUnguardedNoticeStyles(tokens);

  return (
    <View style={styles.panel} role="status">
      <FontAwesome6 name="triangle-exclamation" solid size={18} color={tokens.flagRed} style={styles.icon} />
      <View style={styles.textCol}>
        <Text style={styles.headline}>Caution: unguarded beach</Text>
        <Text style={styles.sentence}>
          No lifeguard is on duty here — swim at your own risk and keep a close eye on conditions.
        </Text>
      </View>
    </View>
  );
}
