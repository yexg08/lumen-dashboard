import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/format.ts";
import { EASE_OUT } from "../../lib/motion.ts";

interface PopoverProps {
  className?: string;
  children: ReactNode;
}

export function Popover({ className, children }: PopoverProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      style={{ transformOrigin: "top right" }}
      className={cn(
        "absolute right-0 top-full z-40 mt-3 overflow-hidden rounded-3xl bg-white shadow-[0_24px_48px_-12px_rgb(0_0_0/0.18)] ring-1 ring-zinc-900/[0.06] dark:bg-ink-800 dark:shadow-[0_24px_48px_-12px_rgb(0_0_0/0.6)] dark:ring-white/[0.08]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
