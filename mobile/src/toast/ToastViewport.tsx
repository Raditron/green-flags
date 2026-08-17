import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "./Toast";
import type { ToastViewportProps } from "./interfaces";
import { getToastViewportStyles } from "./styles/ToastViewport.styles";

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  const insets = useSafeAreaInsets();
  const styles = getToastViewportStyles(insets.bottom + 20);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.viewport} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          content={toast.content}
          autoDismiss={toast.autoDismiss}
          version={toast.version}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </View>
  );
}
