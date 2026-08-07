import { Toast } from "./Toast";
import { getToastViewportStyles } from "./styles/ToastViewport.styles";

interface ToastMessage {
  id: number;
  message: string;
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  const styles = getToastViewportStyles();

  if (toasts.length === 0) return null;

  return (
    <div style={styles.viewport} aria-live="polite">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}
