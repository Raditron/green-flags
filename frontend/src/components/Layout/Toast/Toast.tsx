import { useEffect } from "react";
import type { ToastProps } from "./interfaces";
import { getToastStyles } from "./styles/Toast.styles";

export const AUTO_DISMISS_MS = 4000;

export function Toast({ content, autoDismiss, version, onDismiss }: ToastProps) {
  const styles = getToastStyles();

  // Restarts whenever `version` changes (i.e. the toast's content was just replaced), so a
  // toast that swaps content in place — a prompt turning into a confirmation message, say —
  // gets its own full countdown rather than inheriting whatever time was left before.
  useEffect(() => {
    if (!autoDismiss) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [autoDismiss, version, onDismiss]);

  return (
    <div style={styles.toast} role="status">
      <div style={styles.content}>{content}</div>
      <button type="button" style={styles.close} onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
