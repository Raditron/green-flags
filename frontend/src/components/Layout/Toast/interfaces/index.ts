import type { ReactNode } from "react";

export interface ToastOptions {
  /** Defaults to true (matches the original plain-message toast behavior). Pass false for
   * content that should stay up until the caller explicitly dismisses/updates it — e.g. a
   * prompt awaiting a response, rather than a message being announced. */
  autoDismiss?: boolean;
}

export interface ToastMessage {
  id: number;
  content: ReactNode;
  autoDismiss: boolean;
  // Bumped on every show()/update() targeting this toast, so Toast's auto-dismiss timer can
  // tell "content actually changed, restart the countdown" apart from an unrelated re-render.
  version: number;
}

export interface ToastContextValue {
  show(content: ReactNode, options?: ToastOptions): number;
  /** Replaces an existing toast's content in place (same id, same position in the stack)
   * instead of appending a new one — used to evolve a single toast through a flow. */
  update(id: number, content: ReactNode, options?: ToastOptions): void;
  dismiss(id: number): void;
}

export interface ToastProviderProps {
  children: ReactNode;
}

export interface ToastProps {
  content: ReactNode;
  autoDismiss: boolean;
  version: number;
  onDismiss: () => void;
}

export interface ToastViewportProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}
