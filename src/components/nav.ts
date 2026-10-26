export const NAV_ITEMS = [
  { id: "overview", label: "Resumen" },
  { id: "activity", label: "Actividad" },
  { id: "manage", label: "Gestión" },
  { id: "program", label: "Programa" },
  { id: "account", label: "Cuenta" },
  { id: "reports", label: "Reportes" },
] as const;

export type NavId = (typeof NAV_ITEMS)[number]["id"];

export function navLabel(id: NavId): string {
  return NAV_ITEMS.find((item) => item.id === id)?.label ?? "";
}
