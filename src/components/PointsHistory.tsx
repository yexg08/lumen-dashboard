import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GiftIcon } from "@heroicons/react/24/outline";
import { CATEGORIES, type HistoryItem } from "../data/mock.ts";
import { cn, formatSigned, relativeDay } from "../lib/format.ts";
import { ICONS } from "../lib/icons.ts";
import { EASE_OUT } from "../lib/motion.ts";
import { Card } from "./ui/Card.tsx";

interface PointsHistoryProps {
  items: HistoryItem[];
  className?: string;
}

const COLLAPSED = 5;

export function PointsHistory({ items, className }: PointsHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, COLLAPSED);

  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Historial de puntos</h2>
        {items.length > COLLAPSED && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            {expanded ? "Ver menos" : "Ver todo"}
          </button>
        )}
      </div>

      <ul className={cn("-mx-2 mt-3", expanded && "max-h-[22rem] overflow-y-auto pr-1")}>
        <AnimatePresence initial={false}>
          {visible.map((item) => (
            <HistoryRow key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </ul>
    </Card>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  const isRedeem = item.amount < 0;
  const Icon = item.category === "redeem" ? GiftIcon : ICONS[CATEGORIES[item.category].icon];

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.32, ease: EASE_OUT }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full",
            isRedeem
              ? "bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300"
              : "bg-ember-50 text-ember-600 dark:bg-ember-500/15 dark:text-ember-300",
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{relativeDay(item.date)}</p>
        </div>
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            isRedeem ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400",
          )}
        >
          {formatSigned(item.amount)}
        </span>
      </div>
    </motion.li>
  );
}
