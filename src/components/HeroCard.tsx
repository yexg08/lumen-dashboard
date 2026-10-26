import type { PointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { GiftIcon } from "@heroicons/react/24/outline";
import { nextTier, POINT_VALUE_COP, tierFor } from "../data/mock.ts";
import { cn, formatCOP, formatInt, formatMonthYear } from "../lib/format.ts";
import { ICONS } from "../lib/icons.ts";
import { EASE_OUT } from "../lib/motion.ts";
import { AnimatedNumber } from "./ui/AnimatedNumber.tsx";
import { Card } from "./ui/Card.tsx";

interface HeroCardProps {
  balance: number;
  tierPoints: number;
  memberSince: Date;
  onRedeem: () => void;
  className?: string;
}

const OFFSCREEN = -600;

export function HeroCard({ balance, tierPoints, memberSince, onRedeem, className }: HeroCardProps) {
  const tier = tierFor(tierPoints);
  const next = nextTier(tierPoints);
  const progress = next ? ((tierPoints - tier.min) / (next.min - tier.min)) * 100 : 100;
  const TierIcon = ICONS[tier.icon];

  // luz que sigue al cursor sobre la tarjeta
  const mouseX = useMotionValue(OFFSCREEN);
  const mouseY = useMotionValue(OFFSCREEN);
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgb(255 255 255 / 0.14), transparent 65%)`;

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const onPointerLeave = () => {
    mouseX.set(OFFSCREEN);
    mouseY.set(OFFSCREEN);
  };

  return (
    <Card
      surface={false}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn(
        "relative isolate overflow-hidden p-0 text-white shadow-[0_28px_56px_-28px_rgb(208_61_12/0.7)]",
        className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#e3511b_0%,#d03d0c_45%,#a92c08_100%)]" />
      <motion.div
        aria-hidden="true"
        className="absolute -right-24 -top-36 -z-10 size-[460px] rounded-full bg-[radial-gradient(circle,rgb(255_150_100/0.6),transparent_65%)] blur-2xl"
        animate={{ x: [0, -40, 12, 0], y: [0, 24, -12, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-44 -left-24 -z-10 size-[380px] rounded-full bg-[radial-gradient(circle,rgb(255_61_99/0.35),transparent_65%)] blur-2xl"
      />
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        fill="none"
        className="absolute -right-20 top-1/2 -z-10 h-[160%] -translate-y-1/2 opacity-[0.13]"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        {[34, 56, 78, 98].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} stroke="white" strokeWidth="0.6" strokeDasharray={r === 78 ? "2 4" : undefined} />
        ))}
      </motion.svg>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: spotlight }} />

      <div className="flex h-full flex-col p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/25 backdrop-blur-sm">
            <TierIcon className="size-3.5" />
            Miembro {tier.name}
          </span>
          <span className="text-xs font-medium">Miembro desde {formatMonthYear(memberSince)}</span>
        </div>

        <div className="mt-8 flex flex-wrap items-baseline gap-x-3 sm:mt-10">
          <AnimatedNumber value={balance} className="text-6xl font-semibold tracking-tight tabular-nums sm:text-7xl" />
          <span className="text-lg font-medium">puntos</span>
        </div>

        <div className="mt-6">
          <div
            role="progressbar"
            aria-label={next ? `Progreso hacia el nivel ${next.name}` : "Nivel máximo"}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            className="relative h-3 overflow-hidden rounded-full bg-[repeating-linear-gradient(115deg,rgb(255_255_255/0.35)_0_1.5px,transparent_1.5px_6px)]"
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-white shadow-[0_0_18px_rgb(255_255_255/0.65)]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.35 }}
            />
          </div>
          <div className="mt-2.5 flex flex-wrap justify-between gap-2 text-xs font-medium">
            <span>
              {tier.name} · {formatInt(tierPoints)} pts de nivel
            </span>
            <span>{next ? `${formatInt(next.min - tierPoints)} pts para ${next.name}` : "Nivel máximo alcanzado"}</span>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
          <motion.button
            type="button"
            onClick={onRedeem}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-lg shadow-black/10 focus-visible:outline-white"
          >
            <GiftIcon className="size-4" />
            Canjear puntos
          </motion.button>
          <span className="text-sm font-medium">≈ {formatCOP(balance * POINT_VALUE_COP)} en recompensas</span>
        </div>
      </div>
    </Card>
  );
}
