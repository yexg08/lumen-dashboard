import { motion, type HTMLMotionProps, type Variants } from "motion/react";
import { cn } from "../../lib/format.ts";
import { EASE_OUT } from "../../lib/motion.ts";

// entrada escalonada que heredan todas las tarjetas desde la pagina
export const riseVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

interface CardProps extends HTMLMotionProps<"section"> {
  surface?: boolean;
}

export function Card({ surface = true, className, children, ...rest }: CardProps) {
  return (
    <motion.section variants={riseVariants} className={cn("rounded-[28px] p-6", surface && "surface", className)} {...rest}>
      {children}
    </motion.section>
  );
}
