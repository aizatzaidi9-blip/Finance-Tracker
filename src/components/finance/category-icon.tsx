"use client";

import {
  Briefcase,
  Car,
  ChartNoAxesColumnIncreasing,
  Gift,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Home,
  MoreHorizontal,
  Music,
  Percent,
  Receipt,
  RefreshCcw,
  Repeat2,
  Shirt,
  ShoppingBag,
  Sprout,
  Trophy,
  UsersRound,
  Utensils,
  WalletCards,
} from "lucide-react";

const icons = {
  wallet: WalletCards,
  trophy: Trophy,
  briefcase: Briefcase,
  sprout: Sprout,
  refresh: RefreshCcw,
  gift: Gift,
  percent: Percent,
  chart: ChartNoAxesColumnIncreasing,
  utensils: Utensils,
  car: Car,
  receipt: Receipt,
  home: Home,
  shopping: ShoppingBag,
  music: Music,
  heart: HeartPulse,
  graduation: GraduationCap,
  shirt: Shirt,
  users: UsersRound,
  repeat: Repeat2,
  hand: HandHeart,
  more: MoreHorizontal,
};

export function CategoryIcon({
  icon,
  colour,
  size = 38,
}: {
  icon: string;
  colour: string;
  size?: number;
}) {
  const Icon = icons[icon as keyof typeof icons] ?? MoreHorizontal;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
      style={{ width: size, height: size, backgroundColor: colour }}
    >
      <Icon size={Math.max(17, size * 0.48)} />
    </span>
  );
}
