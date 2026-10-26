import { createContext, useContext } from "react";

export type Theme = "light" | "dark";

export interface ThemeOrigin {
  x: number;
  y: number;
}

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (next: Theme, origin?: ThemeOrigin) => void;
  toggleTheme: (origin?: ThemeOrigin) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return value;
}

export function originFromElement(el: Element): ThemeOrigin {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// busca el boton de tema visible para que el circulo nazca ahi aunque se use el teclado
export function findThemeOrigin(next: Theme): ThemeOrigin | undefined {
  const nodes = document.querySelectorAll(`[data-theme-target="${next}"], [data-theme-target="toggle"]`);
  for (const node of nodes) {
    if (node.getClientRects().length > 0) return originFromElement(node);
  }
  return undefined;
}
