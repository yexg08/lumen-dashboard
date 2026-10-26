import { addDays, formatDay, formatInt, startOfDay } from "../lib/format.ts";
import type { IconId } from "../lib/icons.ts";
import { mulberry32, pick, randInt, shuffle } from "../lib/random.ts";

export type TierId = "silver" | "gold" | "platinum";
export type CategoryId = "travel" | "groceries" | "dining" | "transport" | "entertainment";

export interface Tier {
  id: TierId;
  name: string;
  min: number;
  icon: IconId;
  perks: string[];
}

export interface HistoryItem {
  id: string;
  title: string;
  date: Date;
  amount: number;
  category: CategoryId | "redeem";
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  ends: Date;
  icon: IconId;
  active: boolean;
}

export interface DailyPoint {
  date: Date;
  value: number;
}

export interface CategoryStat {
  id: CategoryId;
  points: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: IconId;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: IconId;
  unread: boolean;
}

export interface Dataset {
  seed: number;
  balance: number;
  tierPoints: number;
  memberSince: Date;
  history: HistoryItem[];
  offers: Offer[];
  daily: DailyPoint[];
  categories: CategoryStat[];
  notifications: AppNotification[];
}

export const TIERS: Tier[] = [
  {
    id: "silver",
    name: "Plata",
    min: 0,
    icon: "shield",
    perks: [
      "1 punto por cada $1.000 gastados",
      "Ofertas mensuales exclusivas",
      "Soporte por chat en horario hábil",
      "Resumen inteligente de tus gastos",
    ],
  },
  {
    id: "gold",
    name: "Oro",
    min: 5000,
    icon: "trophy",
    perks: [
      "1,5 puntos por cada $1.000 gastados",
      "2 accesos gratis a salas VIP al año",
      "Soporte prioritario por chat",
      "Sin comisión por divisas hasta $5M al mes",
    ],
  },
  {
    id: "platinum",
    name: "Platino",
    min: 15000,
    icon: "sparkles",
    perks: [
      "2 puntos por cada $1.000 gastados",
      "Salas VIP ilimitadas con acompañante",
      "Asesor personal 24/7",
      "Cero comisión por divisas",
      "Upgrade de habitación en hoteles aliados",
    ],
  },
];

export function tierFor(points: number): Tier {
  let result = TIERS[0];
  for (const tier of TIERS) if (points >= tier.min) result = tier;
  return result;
}

export function nextTier(points: number): Tier | undefined {
  return TIERS.find((tier) => tier.min > points);
}

export const CATEGORIES: Record<CategoryId, { label: string; icon: IconId }> = {
  travel: { label: "Viajes", icon: "plane" },
  groceries: { label: "Mercado", icon: "cart" },
  dining: { label: "Restaurantes", icon: "cake" },
  transport: { label: "Transporte", icon: "truck" },
  entertainment: { label: "Entretenimiento", icon: "film" },
};

export const REWARDS: Reward[] = [
  { id: "coffee", title: "Café de especialidad", description: "En cualquier cafetería aliada.", cost: 350, icon: "gift" },
  { id: "lounge", title: "Acceso a sala VIP", description: "Una entrada en aeropuertos nacionales.", cost: 2500, icon: "ticket" },
  { id: "voucher", title: "Bono de $50.000", description: "Abono directo a tu próximo extracto.", cost: 3700, icon: "banknotes" },
  { id: "hotel", title: "Noche de hotel", description: "Habitación doble en hoteles aliados.", cost: 9000, icon: "home" },
];

// cuanto vale un punto en pesos para la equivalencia del hero
export const POINT_VALUE_COP = 13.5;

const OFFER_POOL: Array<Pick<Offer, "title" | "description" | "icon">> = [
  { title: "5% de vuelta en vuelos", description: "Reserva con cualquier aerolínea usando tu tarjeta Lumen.", icon: "plane" },
  { title: "Puntos x2 en mercado", description: "Cada compra de supermercado suma el doble de puntos.", icon: "cart" },
  { title: "Café gratis los viernes", description: "Un café por nuestra cuenta en cafeterías aliadas, cada semana.", icon: "gift" },
  { title: "10% en cine", description: "Descuento en boletas y combos de tus salas favoritas.", icon: "film" },
  { title: "Puntos x3 en gasolina", description: "Triplica tus puntos tanqueando en estaciones aliadas.", icon: "bolt" },
  { title: "Domicilios gratis", description: "Envíos sin costo en apps aliadas durante todo el mes.", icon: "truck" },
];

const EARN_POOL: Array<{ title: string; category: CategoryId; min: number; max: number }> = [
  { title: "Reserva de vuelo", category: "travel", min: 900, max: 1800 },
  { title: "Hotel en Cartagena", category: "travel", min: 1200, max: 2400 },
  { title: "Compra de mercado", category: "groceries", min: 300, max: 1100 },
  { title: "Cena en restaurante", category: "dining", min: 200, max: 700 },
  { title: "Almuerzo con el equipo", category: "dining", min: 150, max: 420 },
  { title: "Tanqueo de gasolina", category: "transport", min: 150, max: 450 },
  { title: "Viajes en app de movilidad", category: "transport", min: 60, max: 220 },
  { title: "Suscripción de streaming", category: "entertainment", min: 60, max: 180 },
  { title: "Boletas de concierto", category: "entertainment", min: 400, max: 900 },
];

const REDEEM_POOL = [
  { title: "Canje · Sala VIP", cost: 2500 },
  { title: "Canje · Bono de $20.000", cost: 1500 },
  { title: "Canje · Café de especialidad", cost: 350 },
];

export function createDataset(seed: number): Dataset {
  const rng = mulberry32(seed);
  const today = startOfDay(new Date());

  // 180 dias para poder comparar cualquier rango con el periodo anterior
  const daily: DailyPoint[] = [];
  const phase = rng() * Math.PI * 2;
  for (let i = 179; i >= 0; i--) {
    const date = addDays(today, -i);
    const t = 179 - i;
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    let value = 95 + t * 0.45 + 55 * Math.sin(t / 5.5 + phase) + rng() * 150 + (weekend ? 70 : 0);
    if (rng() < 0.06) value += 450 + rng() * 900;
    daily.push({ date, value: Math.max(12, Math.round(value)) });
  }

  const history: HistoryItem[] = [];
  for (let k = 0; k < 9; k++) {
    const entry = pick(rng, EARN_POOL);
    const date = addDays(today, -randInt(rng, k === 0 ? 0 : 1, 24));
    date.setHours(randInt(rng, 8, 21), randInt(rng, 0, 59));
    history.push({
      id: `${seed}-e${k}`,
      title: entry.title,
      category: entry.category,
      amount: randInt(rng, entry.min, entry.max),
      date,
    });
  }
  const redeemed = pick(rng, REDEEM_POOL);
  history.push({
    id: `${seed}-r0`,
    title: redeemed.title,
    category: "redeem",
    amount: -redeemed.cost,
    date: addDays(today, -randInt(rng, 2, 12)),
  });
  history.sort((a, b) => b.date.getTime() - a.date.getTime());

  const offers: Offer[] = shuffle(rng, OFFER_POOL)
    .slice(0, 3)
    .map((offer, k) => ({
      ...offer,
      id: `${seed}-o${k}`,
      active: k === 0 || rng() < 0.4,
      ends: addDays(today, randInt(rng, 5, 40)),
    }));

  const categories: CategoryStat[] = [
    { id: "travel", points: randInt(rng, 3500, 7200) },
    { id: "groceries", points: randInt(rng, 2000, 4800) },
    { id: "dining", points: randInt(rng, 1200, 3400) },
    { id: "transport", points: randInt(rng, 700, 2200) },
    { id: "entertainment", points: randInt(rng, 400, 1800) },
  ];

  const latest = history.find((item) => item.amount > 0) ?? history[0];

  return {
    seed,
    balance: randInt(rng, 6500, 14800),
    tierPoints: randInt(rng, 6200, 13800),
    memberSince: new Date(randInt(rng, 2019, 2023), randInt(rng, 0, 11), 1),
    history,
    offers,
    daily,
    categories,
    notifications: [
      {
        id: `${seed}-n0`,
        title: "Sumaste puntos",
        body: `Ganaste ${formatInt(latest.amount)} pts por “${latest.title}”.`,
        time: "Hace 2 h",
        icon: "star",
        unread: true,
      },
      {
        id: `${seed}-n1`,
        title: "Tu oferta vence pronto",
        body: `“${offers[0].title}” vence el ${formatDay(offers[0].ends)}.`,
        time: "Ayer",
        icon: offers[0].icon,
        unread: true,
      },
      {
        id: `${seed}-n2`,
        title: "Nuevo beneficio Platino",
        body: "Ahora incluye upgrade de habitación en hoteles aliados.",
        time: "Hace 3 días",
        icon: "sparkles",
        unread: false,
      },
    ],
  };
}
