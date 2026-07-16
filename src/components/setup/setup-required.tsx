import { DatabaseZap } from "lucide-react";

export function SetupRequired({ message }: { message?: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F7F8FC] px-5 py-10 text-[#172033]">
      <section className="w-full max-w-md rounded-[32px] bg-white p-6 text-center shadow-[0_22px_60px_rgba(45,52,88,0.11)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2F0FF] text-[#6C4CF5]">
          <DatabaseZap size={30} />
        </div>
        <h1 className="mt-5 text-2xl font900">Setup Supabase diperlukan</h1>
        <p className="mt-3 text-sm leading-6 text-[#667085]">
          App sudah connect ke Supabase, tetapi jadual database belum tersedia.
          Jalankan migration dan seed SQL dalam Supabase SQL Editor.
        </p>
        {message ? (
          <p className="mt-4 rounded-2xl bg-[#F7F8FC] p-3 text-xs font700 leading-5 text-[#667085]">
            {message}
          </p>
        ) : null}
      </section>
    </main>
  );
}
