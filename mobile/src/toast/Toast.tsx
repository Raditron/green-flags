import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import type { ToastProps } from "./interfaces";
import { getToastStyles } from "./styles/Toast.styles";

export const AUTO_DISMISS_MS = 4000;

export function Toast({ content, autoDismiss, version, onDismiss }: ToastProps) {
  const { tokens } = useTheme();
  const styles = getToastStyles(tokens);

  // Restarts whenever `version` changes (i.e. the toast's content was just replaced), so a
  // toast that swaps content in place — a prompt turning into a confirmation message, say — gets
  // its own full countdown rather than inheriting whatever time was left before. Mirrors
  // frontend's Layout/Toast/Toast.tsx exactly.
  useEffect(() => {
    if (!autoDismiss) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [autoDismiss, version, onDismiss]);

  return (
    // Matches frontend's `role="status"` exactly (not `accessibilityRole="alert"`, which maps to
    // an assertive/interrupting announcement — `status` is the polite, non-interrupting semantics
    // a transient toast is meant to have).
    <View style={styles.toast} role="status">
      <View style={styles.content}>
        {/* Bare-string content (the common `show("message")` case) needs wrapping in <Text> —
            RN throws if a plain string is a direct child of <View>. JSX content (a caller-built
            prompt with option buttons, say) is rendered as-is. */}
        {typeof content === "string" ? <Text style={styles.contentText}>{content}</Text> : content}
      </View>
      <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Dismiss" hitSlop={8}>
        <Text style={styles.close}>×</Text>
      </Pressable>
    </View>
  );
}
