import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Text, View } from "react-native";
import { useTheme } from "../../../../theme/ThemeContext";
import { getWorstAroundNoticeStyles } from "./styles/WorstAroundNotice.styles";

interface WorstAroundNoticeProps {
  hour: number;
}

// RN port of frontend's DayOutlook/WorstAroundNotice/WorstAroundNotice.tsx. Sits directly under
// Verdict's flag panel — same spot Timeline's live clock occupies — but framed as its own info
// bubble rather than a bare caption, since "why this flag" deserves the same visual weight as an
// actual notice instead of reading as an afterthought.
export function WorstAroundNotice({ hour }: WorstAroundNoticeProps) {
  const { tokens } = useTheme();
  const styles = getWorstAroundNoticeStyles(tokens);

  return (
    <View style={styles.panel} role="status">
      <FontAwesome6 name="circle-info" size={16} color={tokens.info} />
      <Text style={styles.sentence}>Worst around {String(hour).padStart(2, "0")}:00</Text>
    </View>
  );
}
