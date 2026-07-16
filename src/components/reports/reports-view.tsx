"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays, TrendingDown, TrendingUp } from "lucide-react";

import { formatMYR } from "@/lib/finance/money";
import type { FinanceSnapshot } from "@/types/finance";

export function ReportsView({ snapshot }: { snapshot: FinanceSnapshot }) {
  const [period, setPeriod] = useState("Bulanan");
  const categoryById = new Map(snapshot.categories.map((category) => [category.id, category]));
  const totals = useMemo(() => {
    const income = snapshot.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.totalAmount, 0);
    const expense = snapshot.transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.totalAmount, 0);
    const savings = snapshot.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.savingsAmount, 0);
    return { income, expense, savings, net: income - expense };
  }, [snapshot.transactions]);
  const expenseBreakdown = snapshot.transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce<Record<string, number>>((acc, transaction) => {
      acc[transaction.categoryId] = (acc[transaction.categoryId] ?? 0) + transaction.totalAmount;
      return acc;
    }, {});
  const pie = Object.entries(expenseBreakdown).map(([categoryId, amount]) => ({
    name: categoryById.get(categoryId)?.name ?? "Lain-lain",
    amount,
    colour: categoryById.get(categoryId)?.colour ?? "#667085",
  }));
  const weeks = ["M1", "M2", "M3", "M4"].map((week, index) => ({
    week,
    income: [980, 1320, 820, totals.income][index],
    expense: [420, 560, 380, totals.expense][index],
    net: [560, 760, 440, totals.net][index],
  }));

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font800 text-[#667085]">Prestasi kewangan</p>
        <h1 className="text-3xl font900">Laporan</h1>
      </header>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["Mingguan", "Bulanan", "Tahunan", "Custom"].map((item) => (
          <button key={item} onClick={() => setPeriod(item)} className={period === item ? "min-h-11 shrink-0 rounded-full bg-[#6C4CF5] px-4 text-sm font900 text-white" : "min-h-11 shrink-0 rounded-full bg-white px-4 text-sm font900 text-[#667085] shadow-sm"}>
            {item}
          </button>
        ))}
      </div>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ReportMetric label="Duit Masuk" value={totals.income} icon={<TrendingUp />} colour="#12B76A" />
        <ReportMetric label="Duit Keluar" value={totals.expense} icon={<TrendingDown />} colour="#FF4567" />
        <ReportMetric label="Perubahan Bersih" value={totals.net} icon={<CalendarDays />} colour="#4361EE" />
        <ReportMetric label="Ke Simpanan" value={totals.savings} icon={<TrendingUp />} colour="#00BFA6" />
      </section>
      <section className="rounded-[30px] bg-white p-4 shadow-sm">
        <h2 className="mb-4 font900">Carta mingguan</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeks}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" />
              <YAxis tickFormatter={(value) => `RM${Number(value) / 1000}k`} width={44} />
              <Tooltip formatter={(value) => formatMYR(Number(value))} />
              <Bar dataKey="income" fill="#12B76A" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#FF4567" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[30px] bg-white p-4 shadow-sm">
          <h2 className="mb-4 font900">Kategori Duit Keluar</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="amount" nameKey="name" innerRadius={48} outerRadius={84}>
                  {pie.map((item) => <Cell key={item.name} fill={item.colour} />)}
                </Pie>
                <Tooltip formatter={(value) => formatMYR(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[30px] bg-white p-4 shadow-sm">
          <h2 className="mb-4 font900">Trend bersih</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeks}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" />
                <YAxis width={44} />
                <Tooltip formatter={(value) => formatMYR(Number(value))} />
                <Line type="monotone" dataKey="net" stroke="#6C4CF5" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
      <section className="rounded-[28px] bg-gradient-to-br from-[#FF9F1C] to-[#FF4567] p-5 text-white shadow-lg shadow-orange-500/20">
        <p className="font900">Insight laporan</p>
        <p className="mt-2 text-sm leading-6 text-white/90">Kategori tertinggi ialah Makanan & Minuman. Hari belanja tertinggi bulan ini ialah 16 Julai.</p>
      </section>
    </div>
  );
}

function ReportMetric({ label, value, icon, colour }: { label: string; value: number; icon: React.ReactNode; colour: string }) {
  return (
    <div className="rounded-[24px] bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: colour }}>{icon}</div>
      <p className="text-xs font800 text-[#667085]">{label}</p>
      <p className="mt-1 text-lg font900">{formatMYR(value)}</p>
    </div>
  );
}
