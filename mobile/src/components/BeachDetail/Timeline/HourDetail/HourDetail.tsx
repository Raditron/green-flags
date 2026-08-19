import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../../../../theme/ThemeContext";
import type { Confidence } from "../../interfaces";
import type { HourDetailProps } from "./interfaces";
import { getHourDetailStyles } from "./styles/HourDetail.styles";

const RADIUS = 36;
const STROKE_WIDTH = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SVG_SIZE = (RADIUS + STROKE_WIDTH) * 2;
const CENTER = SVG_SIZE / 2;

// The percent renders as the ring fill; this is just the "why" underneath it, so it
// no longer repeats the number the way an earlier single-sentence version did.
function confidenceCaption({ basis, sampleSize }: Confidence): string {
  if (basis === "certain") return "Conditions are clear of every threshold";
  if (basis === "prior" || sampleSize === 0) return "No matching reports yet";
  return `Based on ${sampleSize} past report${sampleSize === 1 ? "" : "s"}`;
}

/**
 * RN port of frontend's Timeline/HourDetail/HourDetail.tsx: the confidence ring named in #97's
 * acceptance criteria, drawn with react-native-svg (the RN equivalent of frontend's raw inline
 * `<svg>`) rather than any percentage-bar substitute, so the visual reads identically.
 */
export function HourDetail({ prediction }: HourDetailProps) {
  const { tokens } = useTheme();
  const styles = getHourDetailStyles(tokens);
  const { percent } = prediction.confidence;
  const dashOffset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <View style={styles.panel} role="status">
      <Text style={styles.hour}>{prediction.hour}:00</Text>

      <View
        style={styles.ringWrap}
        accessible
        role="progressbar"
        aria-label="Confidence"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <Svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
          {/* Dedicated track opacity rather than relying on `border` reading lighter than `text`
              — in the dark theme both tokens resolve to the same "nepal" hex, which made the ring
              look like a solid circle with no visible cutoff (same reasoning as frontend's). */}
          <Circle cx={CENTER} cy={CENTER} r={RADIUS} stroke={tokens.text} strokeWidth={STROKE_WIDTH} fill="none" opacity={0.25} />
          {/* Neutral (the theme's own text color), not the flag palette — this measures how much
              data backs the prediction, not whether the water is safe, so it deliberately reads as
              a different signal than the red/yellow/green flag it sits next to. */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={tokens.text}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            rotation={-90}
            origin={`${CENTER}, ${CENTER}`}
          />
        </Svg>
        <Text style={styles.percent}>{percent}%</Text>
      </View>

      <Text style={styles.caption}>{confidenceCaption(prediction.confidence)}</Text>
    </View>
  );
}
