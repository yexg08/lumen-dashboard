import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { TIERS, tierFor, type TierId } from "../data/mock.ts";
import { cn, formatInt } from "../lib/format.ts";
import { Card } from "./ui/Card.tsx";
import { Segmented } from "./ui/Segmented.tsx";

interface TierBenefitsProps {
  tierPoints: number;
  className?: string;
}

const TIER_OPTIONS = TIERS.map((tier) => ({ value: tier.id, label: tier.name }));

export function TierBenefits({ tierPoints, className }: TierBenefitsProps) {
  const current = tierFor(tierPoints);
  const [picked, setPicked] = useState<TierId | null>(null);
  const selectedId = picked ?? current.id;
  const tier = TIERS.find((t) => t.id === selectedId) ?? current;

  const note =
    tier.id === current.id
      ? "Este es tu nivel actual."
      : tier.min > tierPoints
        ? `Te faltan ${formatInt(tier.min - tierPoints)} pts para desbloquearlo.`
        : "Ya superaste este nivel.";

  return (
    <Card className={cn("flex flex-col", className)}>
      <h2 className="text-lg font-semibold tracking-tight">Beneficios por nivel</h2>

      <div className="mt-4">
        <Segmented options={TIER_OPTIONS} value={selectedId} onChange={setPicked} layoutId="tier-pill" label="Niveles" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={tier.id}
          className="mt-5 space-y-3"
          initial="hidden"
          animate="show"
          exit="exit"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
            exit: { opacity: 0, transition: { duration: 0.12 } },
          }}
        >
          {tier.perks.map((perk) => (
            <motion.li
              key={perk}
              variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
              className="flex items-start gap-3 text-sm"
            >
              <span className="mt-px grid size-5 shrink-0 place-items-center rounded-md bg-ember-50 text-ember-600 dark:bg-ember-500/15 dark:text-ember-300">
                <CheckIcon className="size-3.5" />
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">{perk}</span>
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={note}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="mt-auto pt-6 text-xs text-zinc-500 dark:text-zinc-400"
        >
          {note}
        </motion.p>
      </AnimatePresence>
    </Card>
  );
}
