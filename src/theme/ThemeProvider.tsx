import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { ThemeContext, type Theme, type ThemeOrigin } from "./context.ts";

const STORAGE_KEY = "lumen-theme";
const REVEAL_MS = 750;
const REVEAL_EASING = "cubic-bezier(0.45, 0, 0.15, 1)";

function readInitialTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // sin acceso a storage (modo privado o bloqueado) el tema solo vive en esta sesion
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);
  const current = useRef<Theme>(theme);
  const switching = useRef(false);

  const commit = useCallback((next: Theme) => {
    current.current = next;
    document.documentElement.classList.toggle("dark", next === "dark");
    flushSync(() => setThemeState(next));
    persistTheme(next);
  }, []);

  const setTheme = useCallback(
    (next: Theme, origin?: ThemeOrigin) => {
      if (next === current.current || switching.current) return;

      const root = document.documentElement;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (typeof document.startViewTransition !== "function" || reduceMotion) {
        commit(next);
        return;
      }

      const x = origin?.x ?? window.innerWidth / 2;
      const y = origin?.y ?? window.innerHeight / 2;
      // radio hasta la esquina mas lejana para cubrir toda la pantalla
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      switching.current = true;
      root.classList.add("theme-switching");

      const transition = document.startViewTransition(() => commit(next));
      transition.ready
        .then(() => {
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: REVEAL_MS, easing: REVEAL_EASING, pseudoElement: "::view-transition-new(root)" },
          );
        })
        .catch(() => undefined);
      transition.finished
        .catch(() => undefined)
        .finally(() => {
          root.classList.remove("theme-switching");
          switching.current = false;
        });
    },
    [commit],
  );

  const toggleTheme = useCallback(
    (origin?: ThemeOrigin) => setTheme(current.current === "dark" ? "light" : "dark", origin),
    [setTheme],
  );

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
