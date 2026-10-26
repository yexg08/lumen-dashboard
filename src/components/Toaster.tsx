import { AnimatePresence, motion } from "motion/react";
import { CheckCircleIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { ToastItem } from "../lib/useToasts.ts";

interface ToasterProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = toast.tone === "success" ? CheckCircleIcon : SparklesIcon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl bg-zinc-900 p-4 text-white shadow-xl dark:bg-white dark:text-zinc-900"
            >
              <Icon className={toast.tone === "success" ? "size-5 shrink-0 text-emerald-400 dark:text-emerald-600" : "size-5 shrink-0 text-ember-400 dark:text-ember-600"} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-xs text-zinc-300 dark:text-zinc-600">{toast.description}</p>}
              </div>
              <button
                type="button"
                aria-label="Cerrar aviso"
                onClick={() => onDismiss(toast.id)}
                className="-m-1 rounded-full p-1 text-zinc-400 transition-colors hover:text-white dark:text-zinc-500 dark:hover:text-zinc-900"
              >
                <XMarkIcon className="size-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
