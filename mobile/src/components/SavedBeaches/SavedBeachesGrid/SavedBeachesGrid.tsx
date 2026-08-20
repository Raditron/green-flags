import { FlatList, Text, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { useSavedBeaches } from "../../../saved/SavedBeachesContext";
import { BeachListCard } from "../../BeachList/BeachListCard/BeachListCard";
import { SaveBeachButton } from "../../SaveBeachButton/SaveBeachButton";
import { getBeachListStyles } from "../../BeachList/styles/BeachList.styles";
import { getSavedBeachesGridStyles } from "./styles/SavedBeachesGrid.styles";
import type { SavedBeachesGridProps } from "./interfaces";

/**
 * RN port of frontend's SavedBeachesGrid.tsx: the signed-in visitor's saved Beaches, reusing
 * BeachListCard in the same layout as the Beaches tab's list — #100's acceptance criteria. Each
 * card carries its own unsave star (SaveBeachButton, overlaid via styles — see
 * SavedBeachesGrid.styles.ts) so a Beach can be unsaved right here, without visiting its detail
 * page.
 *
 * Filtered against the live SavedBeachesContext, not `beaches` (this tab's own fetch snapshot), so
 * unsaving a Beach right here drops the card immediately, without a refetch — same reasoning as
 * frontend's SavedBeachesGrid.tsx. Held back until the context's own fetch has settled (`isReady`):
 * both fetches hit the same endpoint independently and can race on first mount, so filtering before
 * the context has caught up could flash — or wrongly show — an empty state for a visitor who does
 * have saved beaches. Until then, this tab's own fresh fetch (`beaches`) is trusted as-is.
 */
export function SavedBeachesGrid({ beaches, onPressBeach }: SavedBeachesGridProps) {
  const { tokens } = useTheme();
  const { isSaved, isReady } = useSavedBeaches();
  const listStyles = getBeachListStyles(tokens);
  const gridStyles = getSavedBeachesGridStyles(tokens);

  const stillSaved = isReady ? beaches.filter((beach) => isSaved(beach.id)) : beaches;

  if (stillSaved.length === 0) {
    return (
      <Text style={listStyles.empty}>
        You haven't saved any beaches yet — tap the star on a beach's detail page to add it here.
      </Text>
    );
  }

  return (
    <FlatList
      data={stillSaved}
      keyExtractor={(beach) => beach.id}
      renderItem={({ item: beach }) => (
        <View style={gridStyles.item}>
          <BeachListCard beach={beach} onPress={() => onPressBeach(beach)} />
          <View style={gridStyles.unsaveButton}>
            <SaveBeachButton beachId={beach.id} />
          </View>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={listStyles.separator} />}
      contentContainerStyle={listStyles.listContent}
    />
  );
}
