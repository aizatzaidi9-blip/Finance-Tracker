"use client";

import { useMemo, useState } from "react";
import { Copy, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ms } from "date-fns/locale";

import { CategoryIcon } from "@/components/finance/category-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMYR } from "@/lib/finance/money";
import type { FinanceSnapshot, TransactionType } from "@/types/finance";

export function TransactionsView({ snapshot }: { snapshot: FinanceSnapshot }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TransactionType>("all");
  const categoryById = useMemo(
    () => new Map(snapshot.categories.map((category) => [category.id, category])),
    [snapshot.categories],
  );
  const rows = useMemo(() => {
    return snapshot.transactions.filter((transaction) => {
      const category = categoryById.get(transaction.categoryId);
      const matchesType = filter === "all" || transaction.type === filter;
      const text = `${category?.name} ${transaction.note ?? ""} ${transaction.destination}`.toLowerCase();
      return matchesType && text.includes(query.toLowerCase());
    });
  }, [categoryById, query, filter, snapshot.transactions]);

  const groups = rows.reduce<Record<string, typeof rows>>((acc, transaction) => {
    const date = parseISO(transaction.transactionDate);
    const label = isToday(date)
      ? "Hari ini"
      : isYesterday(date)
        ? "Semalam"
        : format(date, "d MMMM yyyy", { locale: ms });
    acc[label] = [...(acc[label] ?? []), transaction];
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font800 text-[#667085]">Sejarah lengkap</p>
        <h1 className="text-3xl font900">Transaksi</h1>
      </header>
      <div className="space-y-3">
        <Input icon={<Search size={18} />} placeholder="Cari kategori atau catatan" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            ["all", "Semua"],
            ["income", "Duit Masuk"],
            ["expense", "Duit Keluar"],
          ].map(([value, label]) => (
            <button key={value} onClick={() => setFilter(value as "all" | TransactionType)} className={filter === value ? "min-h-11 shrink-0 rounded-full bg-[#6C4CF5] px-4 text-sm font900 text-white" : "min-h-11 shrink-0 rounded-full bg-white px-4 text-sm font900 text-[#667085] shadow-sm"}>
              {label}
            </button>
          ))}
          <button className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font900 text-[#667085] shadow-sm">
            <SlidersHorizontal size={16} /> Tarikh · Harian · Simpanan · Kategori · Jumlah
          </button>
        </div>
      </div>

      {Object.keys(groups).length === 0 ? (
        <div className="rounded-[30px] bg-white p-8 text-center shadow-sm">
          <Search className="mx-auto text-[#6C4CF5]" size={34} />
          <h2 className="mt-3 font900">Tiada transaksi ditemui</h2>
          <p className="mt-1 text-sm text-[#667085]">Cuba ubah carian atau penapis anda.</p>
        </div>
      ) : null}

      {Object.entries(groups).map(([label, transactions]) => (
        <section key={label} className="space-y-3">
          <h2 className="text-sm font900 text-[#667085]">{label}</h2>
          {transactions.map((transaction) => {
            const category = categoryById.get(transaction.categoryId);
            return (
              <article key={transaction.id} className="group rounded-[26px] bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <CategoryIcon icon={category?.icon ?? "more"} colour={category?.colour ?? "#667085"} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font900">{category?.name}</p>
                    <p className="text-xs font700 text-[#667085]">
                      {transaction.destination === "split" ? "Bahagikan" : transaction.destination === "daily" ? "Harian" : "Simpanan"} · {transaction.transactionTime}
                    </p>
                  </div>
                  <p className={transaction.type === "income" ? "font900 text-[#12B76A]" : "font900 text-[#FF4567]"}>
                    {transaction.type === "income" ? "+" : "-"}{formatMYR(transaction.totalAmount)}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                  <Button variant="secondary" className="min-h-10 text-xs">Butiran</Button>
                  <Button variant="secondary" className="min-h-10 text-xs"><Copy size={14} />Salin</Button>
                  <Button variant="danger" className="min-h-10 text-xs"><Trash2 size={14} />Padam</Button>
                </div>
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
