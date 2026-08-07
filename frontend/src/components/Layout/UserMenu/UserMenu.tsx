import { useRef, useState } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { useDismissibleMenu } from "./hooks/useDismissibleMenu";
import { getUserMenuStyles } from "./styles/UserMenu.styles";

export function UserMenu({ email }: { email: string }) {
  const { logOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismissibleMenu(containerRef, open, setOpen);
  const styles = getUserMenuStyles();
  const initial = email.charAt(0).toUpperCase() || "?";

  function handleLogOut() {
    setOpen(false);
    void logOut();
  }

  return (
    <div style={styles.container} ref={containerRef}>
      <button
        type="button"
        style={styles.chip}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {initial}
      </button>

      {open && (
        <div style={styles.menu} role="menu">
          <button type="button" role="menuitem" style={styles.menuItem} onClick={handleLogOut}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
