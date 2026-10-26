import { useEffect } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { formatInt } from "../../lib/format.ts";

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
}

// cuenta desde el valor anterior hasta el nuevo con un resorte sin rebote
export function AnimatedNumber({ value, format = formatInt, className }: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const spring = useSpring(0, { stiffness: 60, damping: 18, mass: 0.9 });
  const text = useTransform(spring, (v) => format(v));

  useEffect(() => {
    if (reduceMotion) spring.jump(value);
    else spring.set(value);
  }, [value, reduceMotion, spring]);

  return (
    <span className={className}>
      <motion.span aria-hidden="true">{text}</motion.span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
