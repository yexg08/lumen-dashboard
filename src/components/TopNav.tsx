import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AdjustmentsHorizontalIcon,
  ArrowRightStartOnRectangleIcon,
  BellIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import type { AppNotification } from "../data/mock.ts";
import { cn } from "../lib/format.ts";
import { useDismiss } from "../lib/hooks.ts";
import { ICONS, type IconComponent } from "../lib/icons.ts";
import { SPRING } from "../lib/motion.ts";
import { Logo } from "./Logo.tsx";
import { NAV_ITEMS, type NavId } from "./nav.ts";
import { ThemeToggleButton } from "./ThemeToggleButton.tsx";
import { IconButton } from "./ui/IconButton.tsx";
import { Popover } from "./ui/Popover.tsx";

type Menu = "notifications" | "help" | "profile" | null;

interface TopNavProps {
  active: NavId;
  onNavigate: (id: NavId) => void;
  onOpenSearch: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onProfileAction: (label: string) => void;
}

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], label: "Buscar acciones" },
  { keys: ["T"], label: "Cambiar el tema" },
  { keys: ["R"], label: "Regenerar datos" },
  { keys: ["Esc"], label: "Cerrar ventanas" },
];

const PROFILE_ITEMS: Array<{ label: string; icon: IconComponent }> = [
  { label: "Mi perfil", icon: UserCircleIcon },
  { label: "Preferencias", icon: AdjustmentsHorizontalIcon },
  { label: "Cerrar sesión", icon: ArrowRightStartOnRectangleIcon },
];

export function TopNav({ active, onNavigate, onOpenSearch, notifications, onMarkAllRead, onProfileAction }: TopNavProps) {
  const [menu, setMenu] = useState<Menu>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setMenu(null), []);
  useDismiss(actionsRef, close, menu !== null);

  const unread = notifications.filter((n) => n.unread).length;
  const toggle = (next: Exclude<Menu, null>) => setMenu((current) => (current === next ? null : next));

  return (
    <header className="relative z-30 flex flex-wrap items-center gap-3">
      <Logo onClick={() => onNavigate("program")} />

      <nav
        aria-label="Secciones"
        className="order-last -mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 py-1 [scrollbar-width:none] lg:order-none lg:mx-auto lg:w-auto lg:overflow-visible lg:px-0"
      >
        <div className="surface inline-flex items-center gap-1 rounded-full p-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === active;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-white dark:text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={SPRING}
                    className="absolute inset-0 rounded-full bg-zinc-900 dark:bg-white"
                  />
                )}
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div ref={actionsRef} className="relative ml-auto flex items-center gap-2 lg:ml-0">
        <div className="surface flex items-center gap-1 rounded-full p-1.5">
          <IconButton label="Buscar (Ctrl K)" onClick={onOpenSearch}>
            <MagnifyingGlassIcon className="size-5" />
          </IconButton>
          <IconButton
            label="Notificaciones"
            aria-expanded={menu === "notifications"}
            onClick={() => toggle("notifications")}
          >
            <BellIcon className="size-5" />
            <AnimatePresence>
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute right-2 top-2 size-2 rounded-full bg-ember-500 ring-2 ring-white dark:ring-ink-900"
                />
              )}
            </AnimatePresence>
          </IconButton>
          <IconButton label="Atajos de teclado" aria-expanded={menu === "help"} onClick={() => toggle("help")}>
            <QuestionMarkCircleIcon className="size-5" />
          </IconButton>
          <ThemeToggleButton className="lg:hidden" />
        </div>

        <button
          type="button"
          onClick={() => toggle("profile")}
          aria-expanded={menu === "profile"}
          aria-haspopup="menu"
          className="surface flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-3"
        >
          <span className="grid size-9 place-items-center rounded-full bg-linear-to-br from-zinc-700 to-zinc-900 text-xs font-semibold text-white dark:from-zinc-200 dark:to-zinc-400 dark:text-zinc-900">
            AR
          </span>
          <span className="hidden text-left leading-tight xl:block">
            <span className="block text-sm font-semibold">Alex Rivera</span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">alex@lumen.app</span>
          </span>
          <ChevronDownIcon
            className={cn("size-4 text-zinc-500 transition-transform duration-300", menu === "profile" && "rotate-180")}
          />
        </button>

        <AnimatePresence>
          {menu === "notifications" && (
            <Popover key="notifications" className="w-[min(380px,calc(100vw-2rem))]">
              <div className="flex items-center justify-between px-5 pt-4">
                <p className="text-sm font-semibold">Notificaciones</p>
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-xs font-semibold text-ember-700 hover:underline dark:text-ember-300"
                  >
                    Marcar como leídas
                  </button>
                )}
              </div>
              <ul className="p-2">
                {notifications.map((n) => {
                  const Icon = ICONS[n.icon];
                  return (
                    <li key={n.id} className="flex gap-3 rounded-2xl p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.04]">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ember-50 text-ember-600 dark:bg-ember-500/15 dark:text-ember-300">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          {n.title}
                          {n.unread && (
                            <span className="size-1.5 rounded-full bg-ember-500">
                              <span className="sr-only">Sin leer</span>
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{n.body}</p>
                        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{n.time}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Popover>
          )}

          {menu === "help" && (
            <Popover key="help" className="w-64 p-4">
              <p className="text-sm font-semibold">Atajos de teclado</p>
              <ul className="mt-3 space-y-2.5">
                {SHORTCUTS.map((s) => (
                  <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-zinc-600 dark:text-zinc-300">{s.label}</span>
                    <span className="flex gap-1">
                      {s.keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-600 ring-1 ring-zinc-200 dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </Popover>
          )}

          {menu === "profile" && (
            <Popover key="profile" className="w-56 p-2">
              <ul role="menu">
                {PROFILE_ITEMS.map(({ label, icon: Icon }) => (
                  <li key={label} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        close();
                        onProfileAction(label);
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/[0.04] dark:hover:text-white"
                    >
                      <Icon className="size-5 text-zinc-500 dark:text-zinc-400" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </Popover>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
