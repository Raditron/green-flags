import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { resolveTheme } from "./resolveTheme";
import type { Theme } from "./resolveTheme";
import { THEME_TOKENS } from "./tokens";
import type { ThemeContextValue, ThemeProviderProps } from "./interfaces";

// Single source of truth for "has the visitor made an explicit choice" — its absence means "no
// explicit choice yet, follow system". Mirrors frontend's ThemeContext.tsx (same key, same
// semantics — see ADR 0006) with AsyncStorage standing in for localStorage. Exported for tests.
export const STORAGE_KEY = "green-flags-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: ThemeProviderProps) {
  // useColorScheme (unlike web's matchMedia) already re-renders this component on OS-level
  // changes, so following the system preference falls out of resolveTheme() being called on
  // every render — no manual change-listener effect needed, unlike frontend's.
  const prefersDark = useColorScheme() === "dark";

  // The visitor's persisted explicit choice, or null until either it's been loaded (see the
  // effect below) or they've never toggled. Starts null every mount: AsyncStorage is
  // inherently async, so — unlike web's synchronous localStorage read plus pre-mount blocking
  // <script> (ADR 0006) — there's no way to avoid resolving from the OS preference for the first
  // render or two before a stored explicit choice (if any) loads in and this flips.
  const [stored, setStored] = useState<Theme | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (cancelled) return;
      if (value === "light" || value === "dark") setStored(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const theme = resolveTheme(stored, prefersDark);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setStored(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, tokens: THEME_TOKENS[theme], toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
