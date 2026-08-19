import { ScrollView, Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { DashboardSummary } from "./DashboardSummary/DashboardSummary";
import { useDailySummary } from "./hooks/useDailySummary";
import { getDashboardStyles } from "./styles/Dashboard.styles";

/**
 * The Today tab: today's sea-wide average predicted conditions and a per-Area breakdown. RN port
 * of `frontend/src/components/Dashboard/Dashboard.tsx` — same `useDailySummary` states
 * (loading/error/success), same "success but zero sampleSize" empty state, distinct from the
 * error state per #95's acceptance criteria.
 */
export function Dashboard() {
  const summary = useDailySummary();
  const { tokens } = useTheme();
  const styles = getDashboardStyles(tokens);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} accessibilityLabel="Today">
        <Text style={styles.title} role="heading" aria-level={1}>
          Today
        </Text>

        {summary.status === "loading" && <Text style={styles.message}>Loading today's summary…</Text>}

        {summary.status === "error" && (
          <Text style={styles.error}>Could not load today's summary: {summary.message}</Text>
        )}

        {summary.status === "success" && summary.data.averageAttributesBySea.sampleSize === 0 && (
          <Text style={styles.empty}>No predictions yet for today — check back soon.</Text>
        )}

        {summary.status === "success" && summary.data.averageAttributesBySea.sampleSize > 0 && (
          <DashboardSummary
            date={summary.data.date}
            bySea={summary.data.averageAttributesBySea}
            byArea={summary.data.averageAttributesByArea}
          />
        )}
      </ScrollView>
    </View>
  );
}
