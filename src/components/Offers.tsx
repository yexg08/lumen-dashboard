import { AnimatePresence, motion } from "motion/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import type { Offer } from "../data/mock.ts";
import { cn, formatDay } from "../lib/format.ts";
import { ICONS } from "../lib/icons.ts";
import { Card } from "./ui/Card.tsx";

interface OffersProps {
  id?: string;
  offers: Offer[];
  onToggle: (id: string) => void;
  className?: string;
}

export function Offers({ id, offers, onToggle, className }: OffersProps) {
  const activeCount = offers.filter((o) => o.active).length;

  return (
    <Card id={id} className={cn("scroll-mt-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Ofertas para ti</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Activa una oferta y se aplicará en tu próximo pago elegible.
          </p>
        </div>
        <motion.span
          key={activeCount}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="shrink-0 rounded-full bg-ember-50 px-2.5 py-1 text-xs font-semibold text-ember-700 dark:bg-ember-500/15 dark:text-ember-300"
        >
          {activeCount} {activeCount === 1 ? "activa" : "activas"}
        </motion.span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} onToggle={() => onToggle(offer.id)} />
        ))}
      </div>
    </Card>
  );
}

function OfferCard({ offer, onToggle }: { offer: Offer; onToggle: () => void }) {
  const Icon = ICONS[offer.icon];

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "flex flex-col rounded-2xl p-4 ring-1 transition-colors duration-300",
        offer.active
          ? "bg-ember-50/70 ring-ember-300 dark:bg-ember-500/[0.08] dark:ring-ember-500/40"
          : "bg-zinc-50 ring-zinc-200/80 hover:ring-zinc-300 dark:bg-white/[0.03] dark:ring-white/[0.06] dark:hover:ring-white/15",
      )}
    >
      <span
        className={cn(
          "grid size-10 place-items-center rounded-xl shadow-sm transition-colors duration-300",
          offer.active
            ? "bg-white text-ember-600 dark:bg-ember-500/15 dark:text-ember-300"
            : "bg-white text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300",
        )}
      >
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-sm font-semibold">{offer.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{offer.description}</p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-5">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Vence {formatDay(offer.ends)}</span>
        <motion.button
          type="button"
          onClick={onToggle}
          aria-pressed={offer.active}
          whileTap={{ scale: 0.94 }}
          className={cn(
            "inline-flex h-8 min-w-[6.5rem] items-center justify-center overflow-hidden rounded-full px-3.5 text-xs font-semibold transition-colors duration-300",
            offer.active
              ? "bg-ember-600 text-white hover:bg-ember-700"
              : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={offer.active ? "on" : "off"}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1"
            >
              {offer.active ? (
                <>
                  <CheckIcon className="size-3.5" />
                  Activada
                </>
              ) : (
                "Activar"
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.article>
  );
}
