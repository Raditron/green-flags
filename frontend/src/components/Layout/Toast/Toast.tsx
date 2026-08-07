import { useEffect } from "react";
import { getToastStyles } from "./styles/Toast.styles";

const AUTO_DISMISS_MS = 4000;

export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const styles = getToastStyles();

  // Runs once per toast instance (each toast has a stable key), so a fresh timer starts
  // when it mounts and is cleared if it's dismissed manually before it fires.
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div style={styles.toast} role="status">
      <span style={styles.message}>{message}</span>
      <button type="button" style={styles.close} onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
