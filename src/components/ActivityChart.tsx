import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/20/solid";
import type { DailyPoint } from "../data/mock.ts";
import { cn, formatDay, formatInt, formatLongDate, formatPercent, formatWeekday } from "../lib/format.ts";
import { useElementSize } from "../lib/hooks.ts";
import { CHART_ACCENT, EASE_OUT, HOVER_SPRING } from "../lib/motion.ts";
import { AnimatedNumber } from "./ui/AnimatedNumber.tsx";
import { Card } from "./ui/Card.tsx";
import { Segmented } from "./ui/Segmented.tsx";

const RANGE_OPTIONS = [
  { value: 7, label: "7D" },
  { value: 30, label: "30D" },
  { value: 90, label: "90D" },
] as const;
type Range = (typeof RANGE_OPTIONS)[number]["value"];

const VIEW_OPTIONS = [
  { value: "chart", label: "Gráfica" },
  { value: "table", label: "Tabla" },
] as const;
type View = (typeof VIEW_OPTIONS)[number]["value"];

const HEIGHT = 240;
const PAD = { top: 12, right: 10, bottom: 30, left: 46 };

interface Point {
  x: number;
  y: number;
}

interface Geometry {
  pts: Point[];
  line: string;
  area: string;
  ticks: Array<{ value: number; y: number }>;
  base: number;
  step: number;
  xLabels: Array<{ index: number; anchor: "start" | "middle" | "end" }>;
}

const round = (n: number) => Math.round(n * 100) / 100;

function niceScale(max: number, count: number) {
  const safeMax = Math.max(max, 1);
  const rough = safeMax / count;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const n = rough / pow;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow;
  const top = Math.ceil(safeMax / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v);
  return { max: top, ticks };
}

// curva monotona (sin sobrepasar los datos) como la monotoneX de d3
function monotonePath(pts: Point[]): string {
  const n = pts.length;
  if (n < 2) return "";
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1].x - pts[i].x);
    m.push((pts[i + 1].y - pts[i].y) / dx[i]);
  }
  const t: number[] = new Array<number>(n);
  t[0] = m[0];
  t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) {
      t[i] = 0;
    } else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      t[i] = (w1 + w2) / (w1 / m[i - 1] + w2 / m[i]);
    }
  }
  let d = `M${round(pts[0].x)},${round(pts[0].y)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${round(pts[i].x + h)},${round(pts[i].y + h * t[i])} ${round(pts[i + 1].x - h)},${round(pts[i + 1].y - h * t[i + 1])} ${round(pts[i + 1].x)},${round(pts[i + 1].y)}`;
  }
  return d;
}

function buildGeometry(points: DailyPoint[], width: number): Geometry | null {
  if (width < 120 || points.length < 2) return null;
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const { max, ticks } = niceScale(Math.max(...points.map((p) => p.value)), 4);
  const step = innerW / (points.length - 1);
  const base = PAD.top + innerH;
  const pts = points.map((p, i) => ({ x: PAD.left + i * step, y: base - (p.value / max) * innerH }));
  const line = monotonePath(pts);
  const first = pts[0];
  const last = pts[pts.length - 1];
  const area = `${line}L${round(last.x)},${base}L${round(first.x)},${base}Z`;

  const labelCount = points.length <= 7 ? (width < 420 ? 4 : points.length) : width < 520 ? 4 : 6;
  const indices = new Set<number>();
  for (let k = 0; k < labelCount; k++) indices.add(Math.round((k * (points.length - 1)) / (labelCount - 1)));
  const xLabels = [...indices].map((index) => ({
    index,
    anchor: index === 0 ? ("start" as const) : index === points.length - 1 ? ("end" as const) : ("middle" as const),
  }));

  return { pts, line, area, ticks: ticks.map((value) => ({ value, y: base - (value / max) * innerH })), base, step, xLabels };
}

const sum = (points: DailyPoint[]) => points.reduce((acc, p) => acc + p.value, 0);

interface ActivityChartProps {
  daily: DailyPoint[];
  seed: number;
  className?: string;
}

export function ActivityChart({ daily, seed, className }: ActivityChartProps) {
  const [range, setRange] = useState<Range>(30);
  const [view, setView] = useState<View>("chart");
  const [hover, setHover] = useState<number | null>(null);
  const [wrapRef, { width }] = useElementSize<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);

  const current = useMemo(() => daily.slice(-range), [daily, range]);
  const total = useMemo(() => sum(current), [current]);
  const prevTotal = useMemo(() => sum(daily.slice(-range * 2, -range)), [daily, range]);
  const delta = prevTotal > 0 ? (total - prevTotal) / prevTotal : 0;
  const best = useMemo(() => current.reduce((a, b) => (b.value > a.value ? b : a), current[0]), [current]);
  const aboveAverage = useMemo(() => current.filter((d) => d.value > total / current.length).length, [current, total]);
  const geo = useMemo(() => buildGeometry(current, width), [current, width]);

  const changeRange = (next: Range) => {
    setRange(next);
    setHover(null);
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!geo || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const index = Math.round((e.clientX - rect.left - PAD.left) / geo.step);
    setHover(Math.min(Math.max(index, 0), current.length - 1));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = current.length - 1;
    const moves: Record<string, (h: number | null) => number | null> = {
      ArrowRight: (h) => (h === null ? last : Math.min(h + 1, last)),
      ArrowLeft: (h) => (h === null ? last : Math.max(h - 1, 0)),
      Home: () => 0,
      End: () => last,
      Escape: () => null,
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    setHover(move);
  };

  const hovered = hover !== null && geo ? { point: geo.pts[hover], data: current[hover] } : null;
  const tipX = hovered ? Math.min(Math.max(hovered.point.x, 84), width - 84) : 0;

  return (
    <Card className={className}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Puntos ganados</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="flex items-baseline gap-2">
              <AnimatedNumber value={total} className="text-3xl font-semibold tracking-tight tabular-nums" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">pts en {range} días</span>
            </span>
            <DeltaBadge delta={delta} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented options={RANGE_OPTIONS} value={range} onChange={changeRange} layoutId="range-pill" label="Rango de fechas" size="sm" />
          <Segmented options={VIEW_OPTIONS} value={view} onChange={setView} layoutId="view-pill" label="Vista" size="sm" />
        </div>
      </div>

      <div ref={wrapRef} className="relative mt-6 h-[240px]">
        <AnimatePresence mode="wait" initial={false}>
          {view === "chart" ? (
            <motion.div
              key="chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              tabIndex={0}
              role="group"
              aria-label={`Gráfica de puntos ganados por día en los últimos ${range} días. Usa las flechas para recorrerla.`}
              onKeyDown={onKeyDown}
              onBlur={() => setHover(null)}
              className="relative h-full rounded-xl"
            >
              {geo && (
                <svg
                  ref={svgRef}
                  width={width}
                  height={HEIGHT}
                  className="block touch-pan-y overflow-visible"
                  onPointerMove={onPointerMove}
                  onPointerLeave={() => setHover(null)}
                >
                  <defs>
                    <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_ACCENT} stopOpacity={0.26} />
                      <stop offset="100%" stopColor={CHART_ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  {geo.ticks.map((tick) => (
                    <g key={tick.value}>
                      <line
                        x1={PAD.left}
                        x2={width - PAD.right}
                        y1={tick.y}
                        y2={tick.y}
                        strokeDasharray={tick.value === 0 ? undefined : "3 5"}
                        className="stroke-zinc-200 dark:stroke-white/[0.08]"
                      />
                      <text
                        x={PAD.left - 10}
                        y={tick.y}
                        dy="0.32em"
                        textAnchor="end"
                        className="fill-zinc-500 text-[11px] tabular-nums dark:fill-zinc-400"
                      >
                        {formatInt(tick.value)}
                      </text>
                    </g>
                  ))}

                  {geo.xLabels.map(({ index, anchor }) => (
                    <text
                      key={index}
                      x={geo.pts[index].x}
                      y={HEIGHT - 8}
                      textAnchor={anchor}
                      className="fill-zinc-500 text-[11px] dark:fill-zinc-400"
                    >
                      {range === 7 ? formatWeekday(current[index].date) : formatDay(current[index].date)}
                    </text>
                  ))}

                  <motion.path
                    key={`area-${range}-${seed}`}
                    d={geo.area}
                    fill="url(#activity-fill)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.35 }}
                  />
                  <motion.path
                    key={`line-${range}-${seed}`}
                    d={geo.line}
                    fill="none"
                    stroke={CHART_ACCENT}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.1, ease: EASE_OUT }}
                  />

                  <AnimatePresence>
                    {hovered && (
                      <motion.g key="hover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <motion.line
                          x1={0}
                          x2={0}
                          y1={PAD.top}
                          y2={geo.base}
                          strokeDasharray="4 4"
                          className="stroke-zinc-300 dark:stroke-white/25"
                          initial={false}
                          animate={{ x: hovered.point.x }}
                          transition={HOVER_SPRING}
                        />
                        <motion.circle
                          r={5}
                          cx={0}
                          cy={0}
                          fill={CHART_ACCENT}
                          strokeWidth={2}
                          className="stroke-white dark:stroke-ink-900"
                          initial={false}
                          animate={{ x: hovered.point.x, y: hovered.point.y }}
                          transition={HOVER_SPRING}
                        />
                      </motion.g>
                    )}
                  </AnimatePresence>
                </svg>
              )}

              <AnimatePresence>
                {hovered && (
                  <motion.div
                    key="tooltip"
                    className="pointer-events-none absolute left-0 top-0 z-10"
                    initial={{ opacity: 0, x: tipX, y: hovered.point.y }}
                    animate={{ opacity: 1, x: tipX, y: hovered.point.y }}
                    exit={{ opacity: 0 }}
                    transition={{ ...HOVER_SPRING, opacity: { duration: 0.15 } }}
                  >
                    <div className="-translate-x-1/2 -translate-y-full pb-3">
                      <div className="whitespace-nowrap rounded-xl bg-zinc-900 px-3 py-2 text-xs text-white shadow-xl dark:bg-white dark:text-zinc-900">
                        <p className="font-medium text-zinc-300 dark:text-zinc-600">{formatLongDate(hovered.data.date)}</p>
                        <p className="mt-0.5 text-sm font-semibold tabular-nums">+{formatInt(hovered.data.value)} pts</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="sr-only" aria-live="polite">
                {hovered ? `${formatLongDate(hovered.data.date)}, ${formatInt(hovered.data.value)} puntos` : ""}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-auto rounded-xl ring-1 ring-zinc-200 dark:ring-white/[0.06]"
            >
              <table className="w-full text-sm">
                <caption className="sr-only">Puntos ganados por día</caption>
                <thead className="sticky top-0 bg-zinc-50 text-xs text-zinc-500 dark:bg-ink-800 dark:text-zinc-400">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 text-left font-medium">Fecha</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {[...current].reverse().map((d) => (
                    <tr key={d.date.toISOString()} className="border-t border-zinc-100 dark:border-white/[0.04]">
                      <td className="px-4 py-2">{formatLongDate(d.date)}</td>
                      <td className="px-4 py-2 text-right font-medium tabular-nums">{formatInt(d.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-zinc-100 pt-5 dark:border-white/[0.06]">
        <Stat label="Promedio diario" value={`${formatInt(total / current.length)} pts`} />
        <Stat label="Mejor día" value={`${formatInt(best.value)} pts`} hint={formatDay(best.date)} />
        <Stat label="Días sobre el promedio" value={`${aboveAverage}/${range}`} />
      </dl>
    </Card>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  const up = delta >= 0;
  const Icon = up ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        up
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
          : "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-400",
      )}
    >
      <Icon className="size-3.5" />
      {up ? "+" : "−"}
      {formatPercent(delta)} vs. período anterior
    </span>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold tabular-nums">
        {value}
        {hint && <span className="ml-1.5 font-normal text-zinc-500 dark:text-zinc-400">{hint}</span>}
      </dd>
    </div>
  );
}
