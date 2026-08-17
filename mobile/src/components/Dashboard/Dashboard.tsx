import { Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { getDashboardStyles } from "./styles/Dashboard.styles";

/**
 * Placeholder for the Today tab. Mirrors `frontend/src/components/Dashboard/Dashboard.tsx`
 * (today's sea-wide average conditions + per-Area breakdown) — filled in by #95.
 */
export function Dashboard() {
  const { tokens } = useTheme();
  const styles = getDashboardStyles(tokens);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Today placeholder</Text>
    </View>
  );
}
