import { FlatList, Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useBeaches } from "./hooks/useBeaches";
import { useBeachFilters } from "./hooks/useBeachFilters";
import { useUserLocation } from "../../shared/hooks/useUserLocation";
import { BeachListCard } from "./BeachListCard/BeachListCard";
import { BeachListFilters } from "./BeachListFilters/BeachListFilters";
import { getBeachListStyles } from "./styles/BeachList.styles";
import type { BeachesTabScreenProps } from "../../navigation/interfaces";
import type { BeachWithDistance } from "../../shared/types/Beach";

/**
 * The Beaches tab: the curated beach list with Area/search/flag filters, each card showing its
 * predicted flag + confidence and (once the visitor's location is known) distance — see #96's
 * acceptance criteria. RN port of frontend/src/components/BeachList/BeachList.tsx — same
 * loading/error/"Finding your area…"/success states. `isFindingArea` holds the list back behind a
 * brief loading message while geolocation is still resolving, rather than rendering every beach
 * unfiltered and then narrowing to Detected Area a moment later — see ADR 0005's "brief blocking
 * wait, then settle". If location permission is denied or the request fails/times out,
 * `useUserLocation` settles to `"unavailable"` (never `"loading"` forever), so this always falls
 * through to the success view with Selected Area defaulting to All Areas and no distances shown —
 * never a crash, never a stuck loading state.
 *
 * Renders results in a `FlatList` rather than frontend's plain `<ul>` (no RN equivalent, and the
 * curated beach set is long enough to want virtualization — unlike AreaSelect's fixed ~14-item
 * picker, which deliberately avoids FlatList for the opposite reason).
 */
export function BeachList({ navigation }: BeachesTabScreenProps) {
  const beaches = useBeaches();
  const userLocation = useUserLocation();
  const { tokens } = useTheme();
  const styles = getBeachListStyles(tokens);

  const {
    searchQuery,
    setSearchQuery,
    selectedFlag,
    setSelectedFlag,
    selectedArea,
    setSelectedArea,
    isAreaAutoDetected,
    filteredBeaches,
    clearFilters,
  } = useBeachFilters(beaches.status === "success" ? beaches.data : [], userLocation);

  const isFindingArea = beaches.status === "success" && userLocation.status === "loading";

  function handlePressBeach(beach: BeachWithDistance) {
    // Passes what this card already has, mirroring frontend's <Link state={...}> — see useBeach,
    // which prefers these over re-fetching the beach list just to show the same fields again.
    navigation.navigate("BeachDetail", {
      beachId: beach.id,
      name: beach.name,
      quirkNotes: beach.quirkNotes,
      isUnguarded: beach.isUnguarded,
    });
  }

  return (
    <View style={styles.container} accessibilityLabel="All beaches">
      <Text style={styles.title} role="heading" aria-level={1}>
        Beaches
      </Text>

      {beaches.status === "loading" && <Text style={styles.message}>Loading beaches…</Text>}

      {beaches.status === "error" && (
        <Text style={styles.error}>Could not load beaches: {beaches.message}</Text>
      )}

      {isFindingArea && <Text style={styles.message}>Finding your area…</Text>}

      {beaches.status === "success" && !isFindingArea && (
        <FlatList
          data={filteredBeaches}
          keyExtractor={(beach) => beach.id}
          renderItem={({ item: beach }) => (
            <BeachListCard beach={beach} onPress={() => handlePressBeach(beach)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <BeachListFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedFlag={selectedFlag}
              onSelectFlag={setSelectedFlag}
              selectedArea={selectedArea}
              onAreaChange={setSelectedArea}
              isAreaAutoDetected={isAreaAutoDetected}
              onClearFilters={clearFilters}
            />
          }
          ListEmptyComponent={<Text style={styles.empty}>No beaches match your search.</Text>}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}
