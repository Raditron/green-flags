import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useToast } from "../../toast/ToastContext";
import { getBeachHeroImage } from "../../shared/data/images";
import { DayOutlook } from "./DayOutlook/DayOutlook";
import { ForecastStrip } from "./ForecastStrip/ForecastStrip";
import { Timeline } from "./Timeline/Timeline";
import { useBeach } from "./hooks/useBeach";
import { usePredictions } from "./hooks/usePredictions";
import { currentSofiaHour, isOutsideLegalWindow } from "./utils/legalWindow";
import { todayInSofia } from "./utils/forecastWindow";
import type { BeachDetailScreenProps } from "../../navigation/interfaces";
import { getBeachDetailStyles } from "./styles/BeachDetail.styles";

const DISCLAIMER_MESSAGE = "Unofficial estimate — not the lifeguard's flag";

/**
 * RN port of frontend's BeachDetail.tsx: the Beach Detail screen reachable from a Beach List card
 * — hero photo, Forecast Strip, Timeline (today) or Day Outlook (any other selected day) — #97's
 * acceptance criteria. Omits frontend's back-arrow/title row (native-stack's own header already
 * supplies both — see RootNavigator.tsx, whose title this keeps in sync via `setOptions` below),
 * SaveBeachButton (#100) and CommentSection (#99), and the `#comments` scroll-into-view effect
 * (no counterpart to scroll to yet without CommentSection).
 */
export function BeachDetail({ route, navigation }: BeachDetailScreenProps) {
  const { beachId, name, quirkNotes, isUnguarded } = route.params;
  const { tokens } = useTheme();
  const styles = getBeachDetailStyles(tokens);
  const { show: showToast, dismiss: dismissToast } = useToast();
  const beach = useBeach(beachId, { name, quirkNotes, isUnguarded });
  const predictions = usePredictions(beachId);
  const outsideLegalWindow = isOutsideLegalWindow();
  const currentHour = outsideLegalWindow ? null : currentSofiaHour();
  // Which Forecast Strip chip is showing: null means Today, which keeps this screen's original
  // Timeline behavior untouched; any other value is a future calendar date (YYYY-MM-DD) that
  // swaps the Timeline area for that day's Day Outlook instead.
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = todayInSofia();
  const heroImage = getBeachHeroImage(beachId);

  useEffect(() => {
    navigation.setOptions({ title: beach.name ?? "Beach" });
  }, [navigation, beach.name]);

  // Fires on every Beach Detail screen mount, including switching straight from one beach to
  // another (a fresh push, since native-stack doesn't remount on param changes the way frontend's
  // key={beachId} forces a remount) — cleanup dismisses the toast so navigating away clears it.
  useEffect(() => {
    const id = showToast(DISCLAIMER_MESSAGE);
    return () => dismissToast(id);
  }, [beachId, showToast, dismissToast]);

  return (
    <ScrollView accessibilityLabel="Beach detail" contentContainerStyle={styles.content}>
      <View style={styles.heroRow}>
        <View style={styles.imageArea}>
          {heroImage ? (
            <Image source={heroImage} style={styles.image} resizeMode="cover" accessibilityLabel="Beach photo" />
          ) : (
            <View style={styles.iconChip}>
              <FontAwesome6 name="water" size={64} color={tokens.iconChipFg} />
            </View>
          )}
        </View>

        <View style={styles.badges}>
          <ForecastStrip
            beachId={beachId}
            selectedDate={selectedDate ?? today}
            onSelect={(date) => setSelectedDate(date === today ? null : date)}
          />

          {selectedDate ? (
            <DayOutlook beachId={beachId} date={selectedDate} isUnguarded={beach.isUnguarded} />
          ) : (
            predictions.status === "success" && (
              <>
                {outsideLegalWindow && <Text style={styles.offWindow}>No lifeguard on duty — estimate only</Text>}
                <Timeline
                  hourlyPredictions={predictions.data.hourlyPredictions}
                  desaturated={outsideLegalWindow}
                  currentHour={currentHour}
                  isUnguarded={beach.isUnguarded}
                />
                <Text style={styles.meta}>Predictions for {predictions.data.date}</Text>
              </>
            )
          )}
        </View>
      </View>

      {beach.quirkNotes && <Text style={styles.description}>{beach.quirkNotes}</Text>}

      {selectedDate === null && predictions.status === "loading" && (
        <Text style={styles.meta}>Loading predictions…</Text>
      )}

      {selectedDate === null && predictions.status === "error" && (
        <Text style={styles.error}>Could not load predictions: {predictions.message}</Text>
      )}
    </ScrollView>
  );
}
