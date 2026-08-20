import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { getFlagStatusText } from "../../../shared/styles/flagColor";
import { formatDistanceKm } from "../../../shared/data/utils/geo";
import { SaveBeachButton } from "../../SaveBeachButton/SaveBeachButton";
import type { BeachListCardProps } from "./interfaces";
import { getBeachListCardStyles } from "./styles/BeachListCard.styles";

/**
 * One beach in the list: name, Area, predicted flag status + confidence, a save star, and
 * distance from the visitor whenever their location is known (recomputed fresh from
 * `beach.distanceKm`, which `useBeachFilters` derives on every render rather than anything
 * persisted) — see #96's acceptance criteria. Deliberately omits frontend BeachListCard.tsx's
 * photo thumbnail, GuardStatusBadge, and comment/report actions: the guarded/unguarded badge and
 * comment/report links belong with BeachDetail's #97-99 scope, not #96's. SaveBeachButton was
 * added for #100 (a corner overlay, same pill treatment SavedBeachesGrid.tsx used to add on top
 * of this card before it grew its own — see BeachListCard.styles.ts). Tapping the card is
 * optional (`onPress`) so BeachList can wire it to the existing BeachDetail placeholder route
 * from #92 without this component knowing about navigation itself; the save star is a nested
 * Pressable, so it claims its own taps without triggering `onPress`.
 */
export function BeachListCard({ beach, onPress }: BeachListCardProps) {
  const { tokens } = useTheme();
  const { styles, flagVar } = getBeachListCardStyles(tokens, { flagColor: beach.currentFlagColor });
  const flagStatusText = getFlagStatusText(beach.currentFlagColor);

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={beach.name}
    >
      <View style={styles.header}>
        {/* Same icon as frontend's FaFlag (react-icons/fa6) — see frontend BeachListCard.tsx. */}
        <FontAwesome6 name="flag" solid size={14} color={flagVar} style={styles.flagIcon} />
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {beach.name}
          </Text>
          <Text style={styles.area}>{beach.area}</Text>
        </View>
        {beach.currentConfidencePercent !== undefined && (
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{beach.currentConfidencePercent}%</Text>
          </View>
        )}
      </View>

      <Text style={styles.statusText}>{flagStatusText ?? "No report yet"}</Text>

      {beach.distanceKm !== undefined && (
        <Text style={styles.distanceText}>{formatDistanceKm(beach.distanceKm)}</Text>
      )}

      <View style={styles.saveButton}>
        <SaveBeachButton beachId={beach.id} />
      </View>
    </Pressable>
  );
}
