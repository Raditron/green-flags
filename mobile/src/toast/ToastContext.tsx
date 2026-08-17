import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ToastViewport } from "./ToastViewport";
import type { ToastContextValue, ToastMessage, ToastOptions, ToastProviderProps } from "./interfaces";

// Direct port of frontend's Layout/Toast/ToastContext.tsx — the state machine (show/update/
// dismiss, id/version bookkeeping) has no DOM dependency, so it carries over unchanged.
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: ToastProviderProps) {
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
