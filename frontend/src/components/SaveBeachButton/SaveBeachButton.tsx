import { useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { useAuth } from "../../auth/AuthContext";
import { useSavedBeaches } from "../../saved/SavedBeachesContext";
import { AuthModal } from "../Auth/AuthModal/AuthModal";
import { getSaveBeachButtonStyles } from "./styles/SaveBeachButton.styles";

/**
 * Star toggle — filled when the beach is saved, outline when it isn't — meant to be dropped in
 * anywhere a star appears (the Beach list card's actions row, and the Beach detail page next to
 * the title). Reads/writes through SavedBeachesContext so every instance for the same beach id
 * stays in sync. A signed-out tap opens the sign-in modal instead of saving.
 *
 * `withLabel` renders a "Save"/"Saved" caption next to the icon, matching the ghost-button look
 * of the list card's Report control, for spots where the button sits in a labelled actions row.
 * Omit it for icon-only spots like the detail page title.
 */
export function SaveBeachButton({
  beachId,
  withLabel = false,
}: {
  beachId: string;
  withLabel?: boolean;
}) {
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedBeaches();
  const [isHovered, setIsHovered] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const saved = Boolean(user) && isSaved(beachId);
  const styles = getSaveBeachButtonStyles({ isHovered, saved, withLabel });

  function handleClick() {
    if (!user) {
      setAuthenticating(true);
      return;
    }
    toggleSave(beachId);
  }

  return (
    <>
      <button
        type="button"
        style={styles.button}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? "Unsave beach" : "Save beach"}
      >
        {saved ? <FaStar style={styles.icon} /> : <FaRegStar style={styles.icon} />}
        {withLabel && (saved ? "Saved" : "Save")}
      </button>
      {authenticating && (
        <AuthModal
          onClose={() => setAuthenticating(false)}
          onAuthenticated={() => setAuthenticating(false)}
        />
      )}
    </>
  );
}
