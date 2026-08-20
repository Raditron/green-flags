import { Pressable, Text, View } from "react-native";
import { buildMonthWithDateReadable } from "../../../../shared/data/utils/toTimeReadable";
import { flagColorFor, getFlagStatusText } from "../../../../shared/styles/flagColor";
import { useTheme } from "../../../../theme/ThemeContext";
import { usePredictions } from "../../hooks/usePredictions";
import { worstCaseHour } from "../../utils/worstCaseHour";
import type { ForecastStripChipProps } from "./interfaces";
import { getForecastStripChipStyles } from "./styles/ForecastStripChip.styles";

// RN port of frontend's ForecastStripChip.tsx. One chip = one independent usePredictions(beachId,
// date) call, so a slow or failed fetch for one day never blocks or alters its six siblings — this
// has to be its own component (rather than a loop body inside ForecastStrip) because React hooks
// can't be called a variable number of times within a single component's render.
export function ForecastStripChip({ beachId, date, label, selected, onSelect, itemStyle }: ForecastStripChipProps) {
  const { tokens } = useTheme();
  const predictions = usePredictions(beachId, date);

  // A 404 means the day is outside the marine wave-data horizon (see backend) — there's nothing to
  // show for it at all, not even a muted placeholder, so the chip renders nothing here rather than
  // an empty flex slot ForecastStrip would otherwise leave in the row. Because that happens here
  // rather than in ForecastStrip's .map, the remaining chips' flex:1 fills the freed-up width
  // instead of leaving a blank gap — the row looks the same whether it has 6 chips or 7.
  if (predictions.status === "not-found") return null;

  // "error" folds into the same muted "failed" look as a genuinely absent day — from a visitor's
  // perspective there's simply no day to view yet, same reasoning DayOutlook uses for its two
  // messages. A success response with no in-window hour also has nothing worth showing.
  const worst = predictions.status === "success" ? worstCaseHour(predictions.data.hourlyPredictions) : null;
  const state = predictions.status === "loading" ? "pending" : worst ? "resolved" : "failed";
  const styles = getForecastStripChipStyles(tokens, { state, selected });
  const dotColor = flagColorFor(worst?.flagColor, tokens);
  const readableDate = buildMonthWithDateReadable({ date });
  const accessibleName =
    state === "pending"
      ? `${label}: loading forecast`
      : state === "failed"
        ? `${label}: forecast unavailable`
        : `${label}: ${getFlagStatusText(worst?.flagColor) ?? label}`;

  return (
    <View style={itemStyle}>
      <Pressable
        onPress={() => onSelect(date)}
        disabled={state === "failed"}
        accessibilityRole="button"
        accessibilityLabel={accessibleName}
        accessibilityState={{ selected, busy: state === "pending" }}
        style={styles.button}
      >
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.date}>{readableDate}</Text>
      </Pressable>
    </View>
  );
}
