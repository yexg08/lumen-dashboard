interface LogoProps {
  onClick: () => void;
}

export function Logo({ onClick }: LogoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Lumen, ir al inicio"
      className="surface flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4"
    >
      <span className="relative grid size-9 place-items-center rounded-full bg-linear-to-br from-ember-400 to-coral-500 shadow-[0_6px_16px_-6px_rgb(244_81_30/0.8)]">
        <span className="absolute inset-[7px] rounded-full ring-2 ring-white/50" />
        <span className="size-2.5 rounded-full bg-white" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Lumen</span>
    </button>
  );
}
