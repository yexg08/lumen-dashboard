export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatInt(value: number): string {
  const rounded = Math.round(value);
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return rounded < 0 ? `-${digits}` : digits;
}

export function formatSigned(value: number): string {
  const rounded = Math.round(value);
  if (rounded === 0) return "0";
  return `${rounded > 0 ? "+" : "−"}${formatInt(Math.abs(rounded))}`;
}

export function formatCOP(value: number): string {
  return `$${formatInt(value)}`;
}

export function formatPercent(ratio: number): string {
  return `${(Math.abs(ratio) * 100).toFixed(1).replace(".", ",")}%`;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const stripDots = (s: string) => s.replace(/\./g, "");

const dayFmt = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" });
const weekdayFmt = new Intl.DateTimeFormat("es-CO", { weekday: "short" });
const longFmt = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" });
const monthYearFmt = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" });

export const formatDay = (d: Date) => stripDots(dayFmt.format(d));
export const formatWeekday = (d: Date) => `${capitalize(stripDots(weekdayFmt.format(d)))} ${d.getDate()}`;
export const formatLongDate = (d: Date) => capitalize(longFmt.format(d));
export const formatMonthYear = (d: Date) => monthYearFmt.format(d);

const DAY_MS = 86_400_000;

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function relativeDay(d: Date, now: Date = new Date()): string {
  const diff = Math.round((startOfDay(now).getTime() - startOfDay(d).getTime()) / DAY_MS);
  if (diff <= 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff < 7) return `Hace ${diff} días`;
  return formatDay(d);
}
