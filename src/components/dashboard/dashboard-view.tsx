"use client";

import Link from "next/link";
import { Bell, Eye, EyeOff, Plus, ReceiptText, TrendingUp } from "lucide-react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { CategoryIcon } from "@/components/finance/category-icon";
import { formatMYR, totalBalance } from "@/lib/finance/money";
import type { FinanceSnapshot } from "@/types/finance";

export function DashboardView({ snapshot }: { snapshot: FinanceSnapshot }) {
  const [visible, setVisible] = useState(true);
  const [chartsReady, setChartsReady] = useState(false);
  const hasTransactions = snapshot.transactions.length > 0;

  useEffect(() => {
    const timer = window.setTimeout(() => setChartsReady(true), 180);
    return () => window.clearTimeout(timer);
  }, []);
  const categoryById = useMemo(
    () => new Map(snapshot.categories.map((category) => [category.id, category])),
    [snapshot.categories],
  );
  const expenseBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    snapshot.transactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        map.set(transaction.categoryId, (map.get(transaction.categoryId) ?? 0) + transaction.totalAmount);
      });
    return Array.from(map.entries())
      .map(([categoryId, amount]) => ({ category: categoryById.get(categoryId), amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [categoryById, snapshot.transactions]);

  const monthlyIncome = snapshot.transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.totalAmount, 0);
  const monthlyExpense = snapshot.transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.totalAmount, 0);

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font800 text-[#667085]">{greeting()},</p>
          <h1 className="text-3xl font900 tracking-normal">
            {snapshot.profile.displayName || "Pengguna"}!
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-[0_8px_24px_rgba(45,52,88,0.08)] backdrop-blur transition active:scale-95" aria-label="Notifikasi">
            <Bell size={19} />
            {hasTransactions ? (
              <span className="absolute right-2 top-2 h-4 w-4 rounded-full bg-[#FF4567] text-[10px] font900 text-white">3</span>
            ) : null}
          </button>
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-[0_8px_24px_rgba(45,52,88,0.08)] backdrop-blur transition active:scale-95"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Sembunyikan baki" : "Tunjuk baki"}
          >
            {visible ? <Eye size={19} /> : <EyeOff size={19} />}
          </button>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <BalanceCard
          title="Baki Semasa"
          subtitle="Tersedia untuk dibelanjakan"
          amount={snapshot.balances.dailyBalance}
          visible={visible}
          gradient="from-[#6C4CF5] to-[#4361EE]"
        />
        <BalanceCard
          title="Simpanan"
          subtitle="Disimpan untuk masa depan"
          amount={snapshot.balances.savingsBalance}
          visible={visible}
          gradient="from-[#12B76A] to-[#00BFA6]"
        />
        <div className="rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-[0_14px_42px_rgba(45,52,88,0.08)] backdrop-blur">
          <p className="text-sm font800 text-[#667085]">Jumlah Keseluruhan</p>
          <p className="mt-2 text-2xl font900">{visible ? formatMYR(totalBalance(snapshot.balances)) : "RM •••••"}</p>
          <div className="mt-2 h-14">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={(hasTransactions ? [12, 19, 16, 24, 22, 29, 27, 34] : [8, 8, 9, 9, 10, 10, 10, 11]).map((value, index) => ({ index, value }))}>
                  <Area type="monotone" dataKey="value" stroke="#6C4CF5" fill="#EDE9FE" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full animate-pulse rounded-2xl bg-[#F2F4F7]" />
            )}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <MetricCard label="Duit Masuk bulan ini" amount={monthlyIncome} tone="green" />
        <MetricCard label="Duit Keluar bulan ini" amount={monthlyExpense} tone="coral" />
      </section>

      <section className="rounded-[30px] bg-white/95 p-4 shadow-[0_18px_50px_rgba(45,52,88,0.08)] backdrop-blur lg:grid lg:grid-cols-[260px_1fr] lg:gap-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font900">Ringkasan Bulan Ini</h2>
            <span className="text-xs font800 text-[#4361EE]">Julai 2026</span>
          </div>
          <div className="relative h-52">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseBreakdown.length ? expenseBreakdown : [{ amount: 1, category: { id: "empty", colour: "#EAECF0" } }]} dataKey="amount" nameKey="category.name" innerRadius={58} outerRadius={84} paddingAngle={3}>
                    {(expenseBreakdown.length ? expenseBreakdown : [{ amount: 1, category: { id: "empty", colour: "#EAECF0" } }]).map((item) => (
                      <Cell key={item.category?.id} fill={item.category?.colour ?? "#667085"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMYR(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="mx-auto mt-6 h-36 w-36 animate-pulse rounded-full bg-[#F2F4F7]" />
            )}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font800 text-[#667085]">Jumlah</span>
              <span className="font900">{formatMYR(monthlyExpense)}</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {expenseBreakdown.length ? expenseBreakdown.map((item) => (
            <div key={item.category?.id} className="flex items-center gap-3">
              <CategoryIcon icon={item.category?.icon ?? "more"} colour={item.category?.colour ?? "#667085"} size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font800">{item.category?.name}</p>
                <p className="text-xs text-[#667085]">{formatMYR(item.amount)}</p>
              </div>
              <span className="text-sm font900">{Math.round((item.amount / monthlyExpense) * 100)}%</span>
            </div>
          )) : <EmptyMini label="Belum ada perbelanjaan bulan ini" />}
        </div>
      </section>

      <section className="rounded-[28px] bg-gradient-to-br from-[#4361EE] to-[#6C4CF5] p-5 text-white shadow-[0_18px_50px_rgba(67,97,238,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font900">Insight Hari Ini</p>
            <p className="mt-2 text-sm leading-6 text-white/90">
              {hasTransactions
                ? "Perbelanjaan makanan meningkat 18% berbanding minggu lepas."
                : "Mulakan dengan rekod pertama untuk lihat insight kewangan anda."}
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/18">
            <TrendingUp />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font900">Transaksi Terkini</h2>
          <Link href="/transactions" className="text-sm font800 text-[#6C4CF5]">Lihat semua</Link>
        </div>
        {snapshot.transactions.length ? snapshot.transactions.slice(0, 5).map((transaction) => {
          const category = categoryById.get(transaction.categoryId);
          return (
            <motion.div layout key={transaction.id} className="flex items-center gap-3 rounded-[24px] bg-white/95 p-3 shadow-[0_10px_30px_rgba(45,52,88,0.07)]">
              <CategoryIcon icon={category?.icon ?? "more"} colour={category?.colour ?? "#667085"} />
              <div className="min-w-0 flex-1">
                <p className="truncate font800">{category?.name}</p>
                <p className="text-xs font700 text-[#667085]">
                  {transaction.destination === "split" ? "Bahagikan" : transaction.destination === "daily" ? "Harian" : "Simpanan"} · {transaction.transactionTime}
                </p>
              </div>
              <p className={transaction.type === "income" ? "font900 text-[#12B76A]" : "font900 text-[#FF4567]"}>
                {transaction.type === "income" ? "+" : "-"}{formatMYR(transaction.totalAmount)}
              </p>
            </motion.div>
          );
        }) : (
          <div className="rounded-[28px] border border-dashed border-[#D0D5DD] bg-white/80 p-6 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2F0FF] text-[#6C4CF5]">
              <ReceiptText size={26} />
            </div>
            <h3 className="mt-4 font900">Belum ada transaksi</h3>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              Tekan butang <span className="font900 text-[#6C4CF5]">+</span> untuk tambah Duit Masuk atau Duit Keluar pertama anda.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function BalanceCard({ title, subtitle, amount, gradient, visible }: { title: string; subtitle: string; amount: number; gradient: string; visible: boolean }) {
  return (
    <motion.div whileTap={{ scale: 0.985 }} className={`rounded-[30px] bg-gradient-to-br ${gradient} p-5 text-white shadow-[0_18px_48px_rgba(67,97,238,0.20)]`}>
      <p className="text-sm font900 text-white/90">{title}</p>
      <motion.p key={`${amount}-${visible}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-3xl font900 tracking-normal">
        {visible ? formatMYR(amount) : "RM •••••"}
      </motion.p>
      <p className="mt-2 text-sm font700 text-white/85">{subtitle}</p>
    </motion.div>
  );
}

function MetricCard({ label, amount, tone }: { label: string; amount: number; tone: "green" | "coral" }) {
  return (
    <div className="rounded-[24px] bg-white/95 p-4 shadow-[0_10px_30px_rgba(45,52,88,0.07)]">
      <p className="text-xs font800 text-[#667085]">{label}</p>
      <p className={tone === "green" ? "mt-2 text-xl font900 text-[#12B76A]" : "mt-2 text-xl font900 text-[#FF4567]"}>
        {formatMYR(amount)}
      </p>
      <p className="mt-1 text-xs font800 text-[#667085]">+12% berbanding bulan lepas</p>
    </div>
  );
}

function EmptyMini({ label }: { label: string }) {
  return (
    <div className="flex min-h-28 flex-col items-center justify-center rounded-[24px] bg-[#F7F8FC] p-4 text-center">
      <Plus className="text-[#98A2B3]" size={22} />
      <p className="mt-2 text-sm font800 text-[#667085]">{label}</p>
    </div>
  );
}

function greeting() {
  const hour = new Date().toLocaleString("ms-MY", { timeZone: "Asia/Kuala_Lumpur", hour: "numeric", hour12: false });
  const value = Number(hour);
  if (value < 11) return "Selamat pagi";
  if (value < 15) return "Selamat tengah hari";
  if (value < 19) return "Selamat petang";
  return "Selamat malam";
}
