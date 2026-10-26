import { AnimatePresence, motion } from "motion/react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { originFromElement, useTheme } from "../theme/context.ts";
import { IconButton } from "./ui/IconButton.tsx";

// boton compacto para pantallas sin la barra lateral
export function ThemeToggleButton({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <IconButton
      label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      data-theme-target="toggle"
      className={className}
      onClick={(e) => toggleTheme(originFromElement(e.currentTarget))}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid place-items-center"
        >
          {isDark ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
        </motion.span>
      </AnimatePresence>
    </IconButton>
  );
}
