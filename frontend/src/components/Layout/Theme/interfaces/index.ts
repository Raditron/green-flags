import type { ReactNode } from "react";
import type { Theme } from "../resolveTheme";

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme(): void;
}

export interface ThemeProviderProps {
  children: ReactNode;
}
