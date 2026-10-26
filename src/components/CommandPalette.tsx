import { useMemo, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { IconComponent } from "../lib/icons.ts";
import { SOFT_SPRING } from "../lib/motion.ts";

export interface PaletteCommand {
  id: string;
  label: string;
  group: string;
  icon: IconComponent;
  shortcut?: string;
  keywords?: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: PaletteCommand[];
}

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function CommandPalette({ open, ...rest }: CommandPaletteProps) {
  return <AnimatePresence>{open && <PaletteDialog {...rest} />}</AnimatePresence>;
}

function PaletteDialog({ onClose, commands }: Omit<CommandPaletteProps, "open">) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return commands;
    return commands.filter((c) => normalize(`${c.label} ${c.group} ${c.keywords ?? ""}`).includes(q));
  }, [commands, query]);

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));
  const activeCommand = results[activeIndex];

  const run = (command: PaletteCommand) => {
    onClose();
    command.run();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length === 0) return;
      const dir = e.key === "ArrowDown" ? 1 : -1;
      setActive((activeIndex + dir + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeCommand) run(activeCommand);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-zinc-950/30 backdrop-blur-[3px] dark:bg-black/50" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -6 }}
        transition={SOFT_SPRING}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-zinc-900/[0.06] dark:bg-ink-900 dark:ring-white/10"
      >
        <div className="flex items-center gap-3 border-b border-zinc-100 px-5 dark:border-white/[0.06]">
          <MagnifyingGlassIcon className="size-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Busca una acción o sección…"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={activeCommand ? `cmd-${activeCommand.id}` : undefined}
            aria-label="Buscar comando"
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-zinc-500 focus-visible:outline-none dark:placeholder:text-zinc-400"
          />
          <kbd className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-500 ring-1 ring-zinc-200 dark:bg-white/[0.06] dark:text-zinc-400 dark:ring-white/10">
            Esc
          </kbd>
        </div>

        <ul id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">Sin resultados para “{query}”</li>
          )}
          {results.map((command, i) => {
            const Icon = command.icon;
            const isActive = i === activeIndex;
            return (
              <li
                key={command.id}
                id={`cmd-${command.id}`}
                role="option"
                aria-selected={isActive}
                onPointerMove={() => setActive(i)}
                onClick={() => run(command)}
                className="relative flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm"
              >
                {isActive && (
                  <motion.span
                    layoutId="palette-active"
                    transition={{ type: "spring", stiffness: 600, damping: 42 }}
                    className="absolute inset-0 rounded-2xl bg-zinc-100 dark:bg-white/[0.06]"
                  />
                )}
                <Icon className="relative size-5 text-zinc-500 dark:text-zinc-400" />
                <span className="relative flex-1 font-medium">{command.label}</span>
                <span className="relative text-xs text-zinc-500 dark:text-zinc-400">{command.group}</span>
                {command.shortcut && (
                  <kbd className="relative rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold text-zinc-500 ring-1 ring-zinc-200 dark:bg-white/[0.06] dark:text-zinc-400 dark:ring-white/10">
                    {command.shortcut}
                  </kbd>
                )}
              </li>
            );
          })}
        </ul>
      </motion.div>
    </motion.div>
  );
}
