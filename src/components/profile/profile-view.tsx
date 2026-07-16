"use client";

import { Download, Moon, Palette, Shield, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createBrowserSupabase } from "@/lib/supabase/client";
import type { FinanceSnapshot } from "@/types/finance";

export function ProfileView({ snapshot }: { snapshot: FinanceSnapshot }) {
  async function signOut() {
    const supabase = createBrowserSupabase();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function exportData(type: "json" | "csv") {
    const data = snapshot.transactions;
    const content =
      type === "json"
        ? JSON.stringify(data, null, 2)
        : [
            "id,type,destination,total_amount,daily_amount,savings_amount,category_id,note,transaction_date,transaction_time",
            ...data.map((row) =>
              [row.id, row.type, row.destination, row.totalAmount, row.dailyAmount, row.savingsAmount, row.categoryId, row.note ?? "", row.transactionDate, row.transactionTime]
                .map((value) => `"${String(value).replaceAll('"', '""')}"`)
                .join(","),
            ),
          ].join("\n");
    const blob = new Blob([content], { type: type === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transaksi-${new Date().toISOString().slice(0, 10)}.${type}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Export ${type.toUpperCase()} tersedia.`);
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font800 text-[#667085]">Tetapan akaun</p>
        <h1 className="text-3xl font900">Profil</h1>
      </header>
      <section className="rounded-[30px] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#6C4CF5] to-[#4361EE] text-white"><UserRound size={28} /></div>
          <div>
            <p className="text-xl font900">{snapshot.profile.displayName}</p>
            <p className="text-sm font700 text-[#667085]">MYR · Asia/Kuala_Lumpur</p>
          </div>
        </div>
      </section>
      <section className="space-y-3">
        <SettingRow icon={<Shield />} title="Keselamatan" value="Sesi Supabase aktif" />
        <SettingRow icon={<Palette />} title="Tema" value="Light · Dark · System" />
        <SettingRow icon={<Moon />} title="Sembunyi baki" value="Boleh ditukar di dashboard" />
      </section>
      <section className="rounded-[30px] bg-white p-5 shadow-sm">
        <h2 className="font900">Kategori</h2>
        <p className="mt-1 text-sm leading-6 text-[#667085]">Tambah, namakan semula, warnakan, jadikan favourite, atau arkib kategori tersuai. Kategori lalai dikekalkan sebagai rujukan.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {snapshot.categories.slice(0, 8).map((category) => (
            <span key={category.id} className="rounded-full bg-[#F2F4F7] px-3 py-2 text-xs font900 text-[#667085]">{category.name}</span>
          ))}
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => exportData("csv")}><Download size={17} />CSV</Button>
        <Button variant="secondary" onClick={() => exportData("json")}><Download size={17} />JSON</Button>
      </section>
      <section className="space-y-3">
        <Button className="w-full" variant="secondary" onClick={signOut}>Log keluar</Button>
        <Button className="w-full" variant="danger" onClick={() => toast.error("Pengesahan diperlukan sebelum semua data dipadam.")}><Trash2 size={17} />Padam semua data</Button>
      </section>
    </div>
  );
}

function SettingRow({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[24px] bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F2F0FF] text-[#6C4CF5]">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="font900">{title}</p>
        <p className="truncate text-sm font700 text-[#667085]">{value}</p>
      </div>
    </div>
  );
}
