import type { ReactNode } from "react";
import type { Theme } from "../resolveTheme";
import type { ThemeTokens } from "../tokens";

export interface ThemeContextValue {
  theme: Theme;
  tokens: ThemeTokens;
  toggleTheme(): void;
}

export interface ThemeProviderProps {
  children: ReactNode;
}
