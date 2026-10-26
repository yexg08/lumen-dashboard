import { motion } from "motion/react";
import { ArrowRightIcon, CubeTransparentIcon } from "@heroicons/react/24/outline";
import { EASE_OUT } from "../lib/motion.ts";
import { navLabel, type NavId } from "./nav.ts";

interface PlaceholderPageProps {
  page: NavId;
  onBack: () => void;
}

export function PlaceholderPage({ page, onBack }: PlaceholderPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="surface grid min-h-[60vh] place-items-center rounded-[28px] p-10 text-center"
    >
      <div className="max-w-sm">
        <motion.div
          className="mx-auto grid size-16 place-items-center rounded-2xl bg-ember-50 text-ember-600 dark:bg-ember-500/15 dark:text-ember-300"
          animate={{ rotate: [0, -8, 8, 0], y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <CubeTransparentIcon className="size-8" />
        </motion.div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">{navLabel(page)}</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Esta sección es solo de muestra. Toda la acción de la demo está en Programa.
        </p>
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Ir a Programa
          <ArrowRightIcon className="size-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
