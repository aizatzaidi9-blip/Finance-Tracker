"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, ReceiptText, UserRound } from "lucide-react";
import { motion } from "framer-motion";

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

  return (
    <div className="min-h-dvh bg-[#F7F8FC] text-[#172033] lg:bg-white">
      <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-[#EAECF0] bg-white p-5 lg:block">
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="mx-auto w-full max-w-md px-4 pb-28 pt-4 sm:max-w-2xl lg:max-w-none lg:px-8 lg:pb-10"
        >
          {children}
        </motion.main>

        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-4 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden">
          <div className="grid h-20 grid-cols-[1fr_1fr_72px_1fr_1fr] items-center rounded-[30px] border border-[#EAECF0] bg-white/95 px-2 shadow-[0_-12px_40px_rgba(45,52,88,0.14)] backdrop-blur">
            {navItems.slice(0, 2).map((item) => (
              <MobileNavItem key={item.href} item={item} active={pathname === item.href} />
            ))}
            <TransactionSheet snapshot={snapshot} floating />
            {navItems.slice(2).map((item) => (
              <MobileNavItem key={item.href} item={item} active={pathname === item.href} />
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
}: {
  item: (typeof navItems)[number];
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font800 text-[#98A2B3]",
        active && "text-[#6C4CF5]",
      )}
    >
      <item.icon size={20} strokeWidth={active ? 2.8 : 2.2} />
      {item.label}
    </Link>
  );
}
