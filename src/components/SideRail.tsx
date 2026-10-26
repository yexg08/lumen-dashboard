import type { ReactNode } from "react";
import { motion } from "motion/react";
import {
  ArrowRightStartOnRectangleIcon,
  CalendarDaysIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  GiftIcon,
  MoonIcon,
  Squares2X2Icon,
  SunIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../lib/format.ts";
import type { IconComponent } from "../lib/icons.ts";
import { SPRING } from "../lib/motion.ts";
import { originFromElement, useTheme, type Theme } from "../theme/context.ts";
import type { NavId } from "./nav.ts";

interface RailItem {
  id: string;
  label: string;
  icon: IconComponent;
  page?: NavId;
}

const MAIN_ITEMS: RailItem[] = [
  { id: "home", label: "Resumen", icon: Squares2X2Icon, page: "overview" },
  { id: "calendar", label: "Actividad", icon: CalendarDaysIcon, page: "activity" },
  { id: "inbox", label: "Mensajes", icon: EnvelopeIcon },
  { id: "docs", label: "Reportes", icon: DocumentTextIcon, page: "reports" },
  { id: "team", label: "Gestión", icon: UsersIcon, page: "manage" },
  { id: "rewards", label: "Recompensas", icon: GiftIcon, page: "program" },
  { id: "settings", label: "Cuenta", icon: Cog6ToothIcon, page: "account" },
];

const BOTTOM_ITEMS: RailItem[] = [
  { id: "history", label: "Historial", icon: ClockIcon },
  { id: "logout", label: "Cerrar sesión", icon: ArrowRightStartOnRectangleIcon },
];

const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: IconComponent }> = [
  { value: "light", label: "Modo claro", icon: SunIcon },
  { value: "dark", label: "Modo oscuro", icon: MoonIcon },
];

interface SideRailProps {
  page: NavId;
  onNavigate: (page: NavId) => void;
  onAction: (id: string, label: string) => void;
  className?: string;
}

export function SideRail({ page, onNavigate, onAction, className }: SideRailProps) {
  return (
    <aside aria-label="Navegación lateral" className={cn("sticky top-6 z-20 flex-col items-center gap-4 self-start", className)}>
      <ThemeSwitch />
      <RailGroup items={MAIN_ITEMS} page={page} onNavigate={onNavigate} onAction={onAction} />
      <RailGroup items={BOTTOM_ITEMS} page={page} onNavigate={onNavigate} onAction={onAction} className="mt-4" />
    </aside>
  );
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <div role="group" aria-label="Tema" className="surface flex flex-col gap-1 rounded-full p-1.5">
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={active}
            data-theme-target={value}
            onClick={(e) => setTheme(value, originFromElement(e.currentTarget))}
            className={cn(
              "group/rail relative grid size-10 place-items-center rounded-full transition-colors",
              active ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
            )}
          >
            {active && (
              <motion.span
                layoutId="theme-pill"
                transition={SPRING}
                className="absolute inset-0 rounded-full bg-zinc-100 dark:bg-white/[0.1]"
              />
            )}
            <motion.span
              className="relative grid"
              animate={{ rotate: active ? (value === "light" ? 90 : -20) : 0, scale: active ? 1 : 0.88 }}
              transition={SPRING}
            >
              <Icon className="size-5" />
            </motion.span>
            <RailTooltip>{label}</RailTooltip>
          </button>
        );
      })}
    </div>
  );
}

interface RailGroupProps {
  items: RailItem[];
  page: NavId;
  onNavigate: (page: NavId) => void;
  onAction: (id: string, label: string) => void;
  className?: string;
}

function RailGroup({ items, page, onNavigate, onAction, className }: RailGroupProps) {
  return (
    <div className={cn("surface flex flex-col gap-1 rounded-full p-1.5", className)}>
      {items.map((item) => {
        const active = item.page === page;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            onClick={() => {
              if (item.page) onNavigate(item.page);
              else onAction(item.id, item.label);
            }}
            className={cn(
              "group/rail relative grid size-10 place-items-center rounded-full transition-colors",
              active
                ? "text-ember-600 dark:text-ember-300"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white",
            )}
          >
            {active && (
              <motion.span
                layoutId="rail-pill"
                transition={SPRING}
                className="absolute inset-0 rounded-full bg-ember-50 dark:bg-ember-500/15"
              />
            )}
            <Icon className="relative size-5" />
            <RailTooltip>{item.label}</RailTooltip>
          </button>
        );
      })}
    </div>
  );
}

function RailTooltip({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-full top-1/2 z-30 ml-3 -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition duration-150 group-hover/rail:translate-x-0 group-hover/rail:opacity-100 group-focus-visible/rail:translate-x-0 group-focus-visible/rail:opacity-100 dark:bg-white dark:text-zinc-900"
    >
      {children}
    </span>
  );
}
