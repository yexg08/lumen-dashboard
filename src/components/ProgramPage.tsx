import { motion } from "motion/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { Dataset } from "../data/mock.ts";
import { EASE_OUT } from "../lib/motion.ts";
import { ActivityChart } from "./ActivityChart.tsx";
import { CategoryBreakdown } from "./CategoryBreakdown.tsx";
import { HeroCard } from "./HeroCard.tsx";
import { Offers } from "./Offers.tsx";
import { PointsHistory } from "./PointsHistory.tsx";
import { TierBenefits } from "./TierBenefits.tsx";
import { riseVariants } from "./ui/Card.tsx";

interface ProgramPageProps {
  data: Dataset;
  regenCount: number;
  onRegenerate: () => void;
  onRedeem: () => void;
  onToggleOffer: (id: string) => void;
}

export function ProgramPage({ data, regenCount, onRegenerate, onRedeem, onToggleOffer }: ProgramPageProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
    >
      <motion.div variants={riseVariants} className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.1]">
            Programa de recompensas
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500 sm:text-base dark:text-zinc-400">
            Gana puntos en cada compra y desbloquea mejores beneficios a medida que subes de nivel.
          </p>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="surface inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-zinc-50 dark:hover:bg-ink-800"
        >
          <motion.span className="grid" animate={{ rotate: regenCount * 360 }} transition={{ duration: 0.7, ease: EASE_OUT }}>
            <ArrowPathIcon className="size-4" />
          </motion.span>
          Regenerar datos
          <kbd className="hidden rounded-md bg-zinc-100 px-1.5 text-[11px] font-semibold text-zinc-500 sm:inline dark:bg-white/[0.08] dark:text-zinc-400">
            R
          </kbd>
        </button>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-12">
        <HeroCard
          className="lg:col-span-8"
          balance={data.balance}
          tierPoints={data.tierPoints}
          memberSince={data.memberSince}
          onRedeem={onRedeem}
        />
        <TierBenefits className="lg:col-span-4" tierPoints={data.tierPoints} />
        <Offers id="ofertas" className="lg:col-span-8" offers={data.offers} onToggle={onToggleOffer} />
        <PointsHistory className="lg:col-span-4" items={data.history} />
        <ActivityChart className="lg:col-span-8" daily={data.daily} seed={data.seed} />
        <CategoryBreakdown className="lg:col-span-4" categories={data.categories} />
      </div>
    </motion.div>
  );
}
