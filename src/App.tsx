import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ArrowPathIcon, ArrowUpRightIcon, GiftIcon, MoonIcon, SunIcon, TicketIcon } from "@heroicons/react/24/outline";
import { CommandPalette, type PaletteCommand } from "./components/CommandPalette.tsx";
import { NAV_ITEMS, type NavId } from "./components/nav.ts";
import { PlaceholderPage } from "./components/PlaceholderPage.tsx";
import { ProgramPage } from "./components/ProgramPage.tsx";
import { RedeemModal } from "./components/RedeemModal.tsx";
import { SideRail } from "./components/SideRail.tsx";
import { Toaster } from "./components/Toaster.tsx";
import { TopNav } from "./components/TopNav.tsx";
import { createDataset, type Dataset, type Reward } from "./data/mock.ts";
import { formatInt } from "./lib/format.ts";
import { randomSeed } from "./lib/random.ts";
import { useToasts } from "./lib/useToasts.ts";
import { findThemeOrigin, useTheme } from "./theme/context.ts";

export default function App() {
  const [data, setData] = useState<Dataset>(() => createDataset(randomSeed()));
  const [page, setPage] = useState<NavId>("program");
  const [regenCount, setRegenCount] = useState(0);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { toasts, push, dismiss } = useToasts();
  const { theme, setTheme } = useTheme();

  const switchTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next, findThemeOrigin(next));
  }, [theme, setTheme]);

  const regenerate = useCallback(() => {
    setData(createDataset(randomSeed()));
    setRegenCount((n) => n + 1);
    push({ title: "Datos regenerados", description: "Nuevos números aleatorios en todo el tablero.", tone: "info" });
  }, [push]);

  const redeem = useCallback(
    (reward: Reward) => {
      setData((d) =>
        d.balance < reward.cost
          ? d
          : {
              ...d,
              balance: d.balance - reward.cost,
              history: [
                { id: `redeem-${Date.now()}`, title: `Canje · ${reward.title}`, date: new Date(), amount: -reward.cost, category: "redeem" },
                ...d.history,
              ],
            },
      );
      setRedeemOpen(false);
      push({ title: "¡Canje exitoso!", description: `${reward.title} por ${formatInt(reward.cost)} pts.`, tone: "success" });
    },
    [push],
  );

  const toggleOffer = useCallback(
    (id: string) => {
      const offer = data.offers.find((o) => o.id === id);
      if (!offer) return;
      setData((d) => ({ ...d, offers: d.offers.map((o) => (o.id === id ? { ...o, active: !o.active } : o)) }));
      push(
        offer.active
          ? { title: "Oferta desactivada", description: offer.title, tone: "info" }
          : { title: "Oferta activada", description: `${offer.title} se aplicará en tu próximo pago.`, tone: "success" },
      );
    },
    [data.offers, push],
  );

  const markAllRead = useCallback(() => {
    setData((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, unread: false })) }));
  }, []);

  const demoAction = useCallback(
    (label: string) => push({ title: label, description: "Esto es una demo, aquí no pasa nada real.", tone: "info" }),
    [push],
  );

  const closeRedeem = useCallback(() => setRedeemOpen(false), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  const commands = useMemo<PaletteCommand[]>(
    () => [
      {
        id: "theme",
        label: theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
        group: "Apariencia",
        icon: theme === "dark" ? SunIcon : MoonIcon,
        shortcut: "T",
        keywords: "tema oscuro claro dark light",
        // espera a que la paleta termine de cerrarse para que no salga en la captura
        run: () => window.setTimeout(switchTheme, 220),
      },
      {
        id: "redeem",
        label: "Canjear puntos",
        group: "Acciones",
        icon: GiftIcon,
        keywords: "recompensas premio",
        run: () => {
          setPage("program");
          setRedeemOpen(true);
        },
      },
      {
        id: "regenerate",
        label: "Regenerar datos",
        group: "Acciones",
        icon: ArrowPathIcon,
        shortcut: "R",
        keywords: "aleatorio random nuevos",
        run: regenerate,
      },
      {
        id: "offers",
        label: "Ver ofertas",
        group: "Acciones",
        icon: TicketIcon,
        keywords: "descuentos promociones",
        run: () => {
          setPage("program");
          window.setTimeout(() => document.getElementById("ofertas")?.scrollIntoView({ behavior: "smooth", block: "center" }), 350);
        },
      },
      ...NAV_ITEMS.map((item) => ({
        id: `nav-${item.id}`,
        label: `Ir a ${item.label}`,
        group: "Navegación",
        icon: ArrowUpRightIcon,
        run: () => setPage(item.id),
      })),
    ],
    [theme, switchTheme, regenerate],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (paletteOpen || redeemOpen) return;
      if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable='true']")) return;
      const key = e.key.toLowerCase();
      if (key === "t") switchTheme();
      else if (key === "r") regenerate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, redeemOpen, switchTheme, regenerate]);

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-zinc-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Saltar al contenido
      </a>

      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-4 sm:px-6 lg:pt-6">
        <TopNav
          active={page}
          onNavigate={setPage}
          onOpenSearch={() => setPaletteOpen(true)}
          notifications={data.notifications}
          onMarkAllRead={markAllRead}
          onProfileAction={demoAction}
        />

        <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[56px_minmax(0,1fr)] lg:gap-8">
          <SideRail className="hidden lg:flex" page={page} onNavigate={setPage} onAction={(_, label) => demoAction(label)} />

          <main id="contenido" tabIndex={-1} className="min-w-0 outline-none">
            <AnimatePresence mode="wait">
              {page === "program" ? (
                <ProgramPage
                  key="program"
                  data={data}
                  regenCount={regenCount}
                  onRegenerate={regenerate}
                  onRedeem={() => setRedeemOpen(true)}
                  onToggleOffer={toggleOffer}
                />
              ) : (
                <PlaceholderPage key={page} page={page} onBack={() => setPage("program")} />
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      <RedeemModal open={redeemOpen} balance={data.balance} onClose={closeRedeem} onRedeem={redeem} />
      <CommandPalette open={paletteOpen} onClose={closePalette} commands={commands} />
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
