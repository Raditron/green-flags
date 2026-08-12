import { getBeachListStyles } from "../../../BeachList/styles/BeachList.styles";

// SavedBeachesGrid deliberately reuses the main Beach list's card-grid and
// empty-state treatment rather than inventing its own — this is the same
// shortlist UI, just filtered down to saved beaches.
export const getSavedBeachesGridStyles = getBeachListStyles;
