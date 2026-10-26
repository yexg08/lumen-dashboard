import { motion } from "motion/react";
import { cn } from "../../lib/format.ts";
import { SPRING } from "../../lib/motion.ts";

interface SegmentedProps<T extends string | number> {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  label: string;
  size?: "sm" | "md";
}

export function Segmented<T extends string | number>({ options, value, onChange, layoutId, label, size = "md" }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-full bg-zinc-100 p-1 dark:bg-white/[0.06]">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-full font-medium transition-colors",
              size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
              active
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={SPRING}
                className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-zinc-900/5 dark:bg-white/[0.12] dark:shadow-none dark:ring-0"
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
