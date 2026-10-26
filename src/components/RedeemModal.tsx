import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { REWARDS, type Reward } from "../data/mock.ts";
import { formatInt } from "../lib/format.ts";
import { ICONS } from "../lib/icons.ts";
import { SOFT_SPRING } from "../lib/motion.ts";
import { IconButton } from "./ui/IconButton.tsx";

interface RedeemModalProps {
  open: boolean;
  balance: number;
  onClose: () => void;
  onRedeem: (reward: Reward) => void;
}

export function RedeemModal({ open, ...rest }: RedeemModalProps) {
  return <AnimatePresence>{open && <RedeemDialog {...rest} />}</AnimatePresence>;
}

function RedeemDialog({ balance, onClose, onRedeem }: Omit<RedeemModalProps, "open">) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm dark:bg-black/60" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="redeem-title"
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        transition={SOFT_SPRING}
        className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl dark:bg-ink-900 dark:ring-1 dark:ring-white/10"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="redeem-title" className="text-xl font-semibold tracking-tight">
              Canjear puntos
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Tienes <span className="font-semibold text-zinc-900 dark:text-white">{formatInt(balance)} pts</span> disponibles.
            </p>
          </div>
          <IconButton label="Cerrar" onClick={onClose} autoFocus>
            <XMarkIcon className="size-5" />
          </IconButton>
        </div>

        <motion.ul
          className="mt-6 space-y-2"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
        >
          {REWARDS.map((reward) => {
            const Icon = ICONS[reward.icon];
            const missing = reward.cost - balance;
            return (
              <motion.li
                key={reward.id}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="flex items-center gap-4 rounded-2xl p-3 ring-1 ring-zinc-200/80 dark:ring-white/[0.06]"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ember-50 text-ember-600 dark:bg-ember-500/15 dark:text-ember-300">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{reward.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{reward.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums">{formatInt(reward.cost)} pts</p>
                  {missing <= 0 ? (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => onRedeem(reward)}
                      className="mt-1 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      Canjear
                    </motion.button>
                  ) : (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Te faltan {formatInt(missing)}</p>
                  )}
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
