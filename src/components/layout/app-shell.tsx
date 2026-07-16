"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, ReceiptText, UserRound } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { TransactionSheet } from "@/components/forms/transaction-sheet";
import type { FinanceSnapshot } from "@/types/finance";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/transactions", label: "Transaksi", icon: ReceiptText },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/profile", label: "Profil", icon: UserRound },
];

export function AppShell({
  children,
  snapshot,
}: {
  children: React.ReactNode;
  snapshot: FinanceSnapshot;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    if (!navigating) return;
    const timer = window.setTimeout(() => setNavigating(false), 850);
    return () => window.clearTimeout(timer);
  }, [navigating]);

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,#EEF2FF,transparent_34%),linear-gradient(180deg,#FFFFFF_0%,#F7F8FC_58%)] text-[#172033] lg:bg-white">
      {navigating ? (
        <motion.div
          className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-[#6C4CF5] via-[#4361EE] to-[#00BFA6]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 0.88 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : null}
      <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-[#EAECF0] bg-white/90 p-5 backdrop-blur lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C4CF5] to-[#4361EE] text-white">
              <ReceiptText size={22} />
            </div>
            <div>
              <p className="font900">Harian & Simpanan</p>
              <p className="text-xs font700 text-[#667085]">ms-MY · MYR</p>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => item.href !== pathname && setNavigating(true)}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font800 text-[#667085]",
                  pathname === item.href && "bg-[#F2F0FF] text-[#6C4CF5]",
                )}
              >
                <item.icon size={19} />
                {item.label}
              </Link>
            ))}
          </nav>
          <TransactionSheet snapshot={snapshot} triggerLabel="Tambah Transaksi" />
        </aside>

        <motion.main
          key={pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-md px-4 pb-28 pt-4 sm:max-w-2xl lg:max-w-none lg:px-8 lg:pb-10"
        >
          {children}
        </motion.main>

        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-4 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden">
          <div className="grid h-20 grid-cols-[1fr_1fr_72px_1fr_1fr] items-center rounded-[30px] border border-white/80 bg-white/90 px-2 shadow-[0_-10px_34px_rgba(45,52,88,0.12)] backdrop-blur-xl">
            {navItems.slice(0, 2).map((item) => (
              <MobileNavItem
                key={item.href}
                item={item}
                active={pathname === item.href}
                onNavigate={() => setNavigating(true)}
              />
            ))}
            <TransactionSheet snapshot={snapshot} floating />
            {navItems.slice(2).map((item) => (
              <MobileNavItem
                key={item.href}
                item={item}
                active={pathname === item.href}
                onNavigate={() => setNavigating(true)}
              />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function MobileNavItem({
  item,
  active,
  onNavigate,
}: {
  item: (typeof navItems)[number];
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={() => !active && onNavigate()}
      className={cn(
        "relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font800 text-[#98A2B3] transition active:scale-95",
        active && "text-[#6C4CF5]",
      )}
    >
      {active ? (
        <motion.span
          layoutId="mobile-nav-pill"
          className="absolute inset-x-3 top-2 h-9 rounded-2xl bg-[#F2F0FF]"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      ) : null}
      <span className="relative z-10">
      <item.icon size={20} strokeWidth={active ? 2.8 : 2.2} />
      </span>
      <span className="relative z-10">
      {item.label}
      </span>
    </Link>
  );
}
