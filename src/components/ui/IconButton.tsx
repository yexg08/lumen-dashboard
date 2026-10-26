import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/format.ts";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export function IconButton({ label, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "relative grid size-9 place-items-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:text-white",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
