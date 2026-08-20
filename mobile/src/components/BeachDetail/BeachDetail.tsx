import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";
import { useToast } from "../../toast/ToastContext";
import { getBeachHeroImage } from "../../shared/data/images";
import { SaveBeachButton } from "../SaveBeachButton/SaveBeachButton";
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
const SAVED_MESSAGE = "Saved to your beaches";

/**
 * RN port of frontend's BeachDetail.tsx: the Beach Detail screen reachable from a Beach List card
 * — hero photo, Forecast Strip, Timeline (today) or Day Outlook (any other selected day) — #97's
 * acceptance criteria, plus a save/unsave star (#100). Omits frontend's back-arrow/title row
 * (native-stack's own header already supplies both — see RootNavigator.tsx, whose title this keeps
 * in sync via `setOptions` below) and CommentSection (#99), and the `#comments` scroll-into-view
 * effect (no counterpart to scroll to yet without CommentSection). The star lives in the native
 * header's `headerRight` (set via `setOptions`, same as the title) rather than frontend's title
 * row — there's no in-body title here for it to sit "next to" (the native header already carries
 * the beach name), so it sits alongside the back chevron and name instead — and fires a toast on
 * save (not unsave, mirroring the disclaimer toast's one-shot confirmation) per #100's acceptance
 * criteria, a deliberate mobile-only addition frontend's own quiet SaveBeachButton doesn't have.
 */
export function BeachDetail({ route, navigation }: BeachDetailScreenProps) {
  const { beachId, name, quirkNotes, isUnguarded } = route.params;
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getBeachDetailStyles(tokens, insets.bottom);
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

  // useCallback'd so the setOptions effect below can list it as a dependency without re-running on
  // every render — otherwise the effect (gated on [navigation, beach.name, beachId]) would close
  // over whatever showToast reference existed the last time it happened to run, not necessarily the
  // current one.
  const handleSaveToggle = useCallback(
    (saved: boolean) => {
      if (saved) {
        showToast(SAVED_MESSAGE);
      }
    },
    [showToast],
  );

  useEffect(() => {
    navigation.setOptions({
      title: beach.name ?? "Beach",
      headerRight: () => <SaveBeachButton beachId={beachId} onToggle={handleSaveToggle} />,
    });
  }, [navigation, beach.name, beachId, handleSaveToggle]);

  // Fires on every Beach Detail screen mount, including switching straight from one beach to
  // another (a fresh push, since native-stack doesn't remount on param changes the way frontend's
  // key={beachId} forces a remount) — cleanup dismisses the toast so navigating away clears it.
  useEffect(() => {
    const id = showToast(DISCLAIMER_MESSAGE);
    return () => dismissToast(id);
  }, [beachId, showToast, dismissToast]);

  return (
    <View style={styles.container}>
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

        {beach.quirkNotes && <Text style={styles.description}>{beach.quirkNotes}</Text>}

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

        {selectedDate === null && predictions.status === "loading" && (
          <Text style={styles.meta}>Loading predictions…</Text>
        )}

        {selectedDate === null && predictions.status === "error" && (
          <Text style={styles.error}>Could not load predictions: {predictions.message}</Text>
        )}
      </ScrollView>
    </View>
  );
}
