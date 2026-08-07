import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ToastViewport } from "./ToastViewport";

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

interface ToastContextValue {
  show(content: ReactNode, options?: ToastOptions): number;
  /** Replaces an existing toast's content in place (same id, same position in the stack)
   * instead of appending a new one — used to evolve a single toast through a flow. */
  update(id: number, content: ReactNode, options?: ToastOptions): void;
  dismiss(id: number): void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);
  const nextVersion = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((content: ReactNode, options?: ToastOptions) => {
    const id = nextId.current++;
    const version = nextVersion.current++;
    setToasts((current) => [
      ...current,
      { id, content, autoDismiss: options?.autoDismiss ?? true, version },
    ]);
    return id;
  }, []);

  const update = useCallback((id: number, content: ReactNode, options?: ToastOptions) => {
    const version = nextVersion.current++;
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id
          ? { ...toast, content, autoDismiss: options?.autoDismiss ?? true, version }
          : toast
      )
    );
  }, []);

  return (
    <ToastContext.Provider value={{ show, update, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
