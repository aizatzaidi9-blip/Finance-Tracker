import Link from "next/link";
import { ArrowRight, ChartPie, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,#EDE9FE,transparent_36%),linear-gradient(180deg,#FFFFFF_0%,#F7F8FC_70%)] px-5 py-6 text-slate-950">
      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-md flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C4CF5] to-[#4361EE] text-white shadow-lg shadow-indigo-500/30">
            <ChartPie size={22} />
          </div>
          <Link
            href="/login"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font700 text-slate-700 shadow-sm"
          >
            Log masuk
          </Link>
        </div>

        <div className="space-y-7 py-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font700 text-[#6C4CF5] shadow-sm">
            <Sparkles size={16} />
            Jejak duit dengan jelas
          </div>
          <div className="space-y-4">
            <h1 className="text-balance text-5xl font900 leading-[0.96] tracking-normal text-[#172033]">
              Baki Harian dan Simpanan, sentiasa kemas.
            </h1>
            <p className="text-pretty text-base leading-7 text-[#667085]">
              Rekod Duit Masuk dan Duit Keluar, kemudian susun baki Harian
              serta Simpanan dengan pantas.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[28px] bg-white p-4 shadow-[0_18px_48px_rgba(45,52,88,0.10)]">
              <p className="text-xs font800 uppercase text-[#667085]">
                Harian
              </p>
              <p className="mt-2 text-2xl font900 text-[#6C4CF5]">
                RM 2,450.00
              </p>
            </div>
            <div className="rounded-[28px] bg-gradient-to-br from-[#12B76A] to-[#00BFA6] p-4 text-white shadow-[0_18px_48px_rgba(18,183,106,0.22)]">
              <p className="text-xs font800 uppercase text-white/80">
                Simpanan
              </p>
              <p className="mt-2 text-2xl font900">RM 6,120.00</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button size="lg" className="w-full">
              Buka dashboard demo
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>

        <div className="rounded-[26px] border border-emerald-100 bg-white p-4 text-sm text-[#667085] shadow-sm">
          <div className="mb-2 flex items-center gap-2 font800 text-[#172033]">
            <ShieldCheck size={18} className="text-[#12B76A]" />
            Sedia untuk Supabase
          </div>
          Data sebenar disimpan per pengguna selepas konfigurasi Supabase.
        </div>
      </section>
    </main>
  );
}
