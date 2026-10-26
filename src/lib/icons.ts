import {
  BanknotesIcon,
  BoltIcon,
  CakeIcon,
  FilmIcon,
  GiftIcon,
  HomeModernIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  SparklesIcon,
  StarIcon,
  TicketIcon,
  TrophyIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

export type IconComponent = typeof StarIcon;

export type IconId =
  | "plane"
  | "cart"
  | "gift"
  | "film"
  | "bolt"
  | "truck"
  | "cake"
  | "ticket"
  | "banknotes"
  | "home"
  | "star"
  | "trophy"
  | "sparkles"
  | "shield";

export const ICONS: Record<IconId, IconComponent> = {
  plane: PaperAirplaneIcon,
  cart: ShoppingCartIcon,
  gift: GiftIcon,
  film: FilmIcon,
  bolt: BoltIcon,
  truck: TruckIcon,
  cake: CakeIcon,
  ticket: TicketIcon,
  banknotes: BanknotesIcon,
  home: HomeModernIcon,
  star: StarIcon,
  trophy: TrophyIcon,
  sparkles: SparklesIcon,
  shield: ShieldCheckIcon,
};
