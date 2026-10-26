import type { Transition } from "motion/react";

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const SPRING: Transition = { type: "spring", stiffness: 420, damping: 34 };
export const SOFT_SPRING: Transition = { type: "spring", stiffness: 260, damping: 28 };
export const HOVER_SPRING: Transition = { type: "spring", stiffness: 520, damping: 42 };

// color de las marcas de las graficas (validado en claro y oscuro)
export const CHART_ACCENT = "#f4511e";
