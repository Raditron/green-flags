import { Toast } from "./Toast";
import type { ToastViewportProps } from "./interfaces";
import { getToastViewportStyles } from "./styles/ToastViewport.styles";

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  const styles = getToastViewportStyles();

  if (toasts.length === 0) return null;

  return (
    <div style={styles.viewport} aria-live="polite">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          content={toast.content}
          autoDismiss={toast.autoDismiss}
          version={toast.version}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}
