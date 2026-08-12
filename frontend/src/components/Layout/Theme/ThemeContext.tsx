import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { resolveTheme } from "./resolveTheme";
import type { Theme } from "./resolveTheme";
import type { ThemeContextValue, ThemeProviderProps } from "./interfaces";

// Single source of truth for "has the visitor made an explicit choice" — its
// absence means "no explicit choice yet, follow system". We only ever store
// "light" or "dark", never a "no preference" sentinel.
const STORAGE_KEY = "green-flags-theme";

function readStoredTheme(): Theme | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

function prefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(readStoredTheme(), prefersDark()));

  // Stay in sync with OS-level changes for as long as the visitor hasn't
  // toggled explicitly — once they have, readStoredTheme() short-circuits
  // resolveTheme before the OS preference is even consulted, so this is a
  // no-op post-toggle.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange() {
      setTheme(resolveTheme(readStoredTheme(), media.matches));
    }
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  // Reflect the resolved theme on <html> so index.css's `[data-theme]`
  // rules apply, and keep `color-scheme` (native form controls/scrollbars)
  // in step with it too.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
