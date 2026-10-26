import { motion } from "motion/react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { CATEGORIES, type CategoryStat } from "../data/mock.ts";
import { cn, formatInt } from "../lib/format.ts";
import { ICONS } from "../lib/icons.ts";
import { EASE_OUT } from "../lib/motion.ts";
import { Card } from "./ui/Card.tsx";

interface CategoryBreakdownProps {
  categories: CategoryStat[];
  className?: string;
}

export function CategoryBreakdown({ categories, className }: CategoryBreakdownProps) {
  const total = categories.reduce((acc, c) => acc + c.points, 0);
  const sorted = [...categories].sort((a, b) => b.points - a.points);
  const max = sorted[0]?.points ?? 1;
  const top = sorted[0] ? CATEGORIES[sorted[0].id].label : "";

  return (
    <Card className={cn("flex flex-col", className)}>
      <h2 className="text-lg font-semibold tracking-tight">¿Dónde sumas más?</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Puntos por categoría en los últimos 90 días.</p>

      <ul className="mt-6 space-y-5">
        {sorted.map((category, i) => {
          const meta = CATEGORIES[category.id];
          const Icon = ICONS[meta.icon];
          const share = total > 0 ? category.points / total : 0;
          return (
            <li key={category.id} title={`${meta.label}: ${formatInt(category.points)} pts (${Math.round(share * 100)}%)`}>
              <div className="flex items-center gap-2.5 text-sm">
                <Icon className="size-4 text-zinc-500 dark:text-zinc-400" />
                <span className="font-medium">{meta.label}</span>
                <span className="ml-auto text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">{formatInt(category.points)}</span> pts ·{" "}
                  {Math.round(share * 100)}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-ember-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(category.points / max) * 100}%` }}
                  transition={{ duration: 0.9, delay: 0.25 + i * 0.07, ease: EASE_OUT }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-6">
        <div className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-3.5 dark:bg-white/[0.03]">
          <SparklesIcon className="mt-0.5 size-5 shrink-0 text-ember-600 dark:text-ember-300" />
          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            Tu categoría estrella es <strong className="font-semibold text-zinc-900 dark:text-white">{top}</strong>. Activa ofertas
            relacionadas para sumar todavía más rápido.
          </p>
        </div>
      </div>
    </Card>
  );
}
