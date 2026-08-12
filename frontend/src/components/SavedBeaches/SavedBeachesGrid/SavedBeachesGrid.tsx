import { useSavedBeaches } from "../../../saved/SavedBeachesContext";
import { BeachListCard } from "../../BeachList/BeachListCard/BeachListCard";
import type { SavedBeachesGridProps } from "./interfaces";
import { getSavedBeachesGridStyles } from "./styles/SavedBeachesGrid.styles";

export function SavedBeachesGrid({ beaches }: SavedBeachesGridProps) {
  const { isSaved, isReady } = useSavedBeaches();
  const listStyles = getSavedBeachesGridStyles();

  // Filtered against the live SavedBeachesContext, not this list's own fetch snapshot, so
  // unsaving a Beach from its star right here drops the card immediately, without a refetch.
  // Held back until the context's own fetch has settled (isReady): both fetches hit the same
  // endpoint independently and race on a direct page load (e.g. a bookmark), so filtering before
  // the context has caught up can flash — or wrongly show — an empty state for a visitor who
  // does have saved beaches. Until then, this page's own fresh fetch is trusted as-is.
  const stillSaved = isReady ? beaches.filter((beach) => isSaved(beach.id)) : beaches;

  if (stillSaved.length === 0) {
    return (
      <p style={listStyles.empty}>
        You haven't saved any beaches yet — tap the star on a beach in the list or on its detail
        page to add it here.
      </p>
    );
  }

  return (
    <ul style={listStyles.list}>
      {stillSaved.map((beach) => (
        <BeachListCard key={beach.id} beach={beach} />
      ))}
    </ul>
  );
}
