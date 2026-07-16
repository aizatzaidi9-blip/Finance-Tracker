"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      if (!supabase) {
        toast.success("Mod demo aktif. Anda boleh terus buka dashboard.");
        window.location.href = "/dashboard";
        return;
      }
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        toast.success("Pautan tetapan semula telah dihantar.");
        return;
      }
      const action =
        mode === "signup"
          ? supabase.auth.signUp({ email, password })
          : supabase.auth.signInWithPassword({ email, password });
      const { error } = await action;
      if (error) throw error;
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Tidak berjaya.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#F7F8FC] px-5 py-5 text-[#172033]">
      <section className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col">
        <Link
          href="/"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="mt-8 rounded-[32px] bg-white p-5 shadow-[0_22px_60px_rgba(45,52,88,0.11)]">
          <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C4CF5] to-[#4361EE] text-white">
            <ShieldCheck size={26} />
          </div>
          <h1 className="text-3xl font900">
            {mode === "login"
              ? "Selamat kembali"
              : mode === "signup"
                ? "Cipta akaun"
                : "Tetapkan semula kata laluan"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Gunakan emel dan kata laluan untuk menyimpan rekod kewangan anda
            dengan selamat.
          </p>
          <div className="mt-7 space-y-4">
            <Input
              aria-label="Emel"
              icon={<Mail size={18} />}
              inputMode="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {mode !== "reset" ? (
              <Input
                aria-label="Kata laluan"
                type="password"
                placeholder="Kata laluan"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            ) : null}
            <Button
              className="w-full"
              size="lg"
              disabled={loading || !email || (mode !== "reset" && !password)}
              onClick={submit}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {mode === "login"
                ? "Log masuk"
                : mode === "signup"
                  ? "Daftar"
                  : "Hantar pautan"}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm font800">
          <button
            className="min-h-12 rounded-2xl bg-white text-[#6C4CF5] shadow-sm"
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          >
            {mode === "signup" ? "Saya sudah ada akaun" : "Daftar akaun"}
          </button>
          <button
            className="min-h-12 rounded-2xl bg-white text-[#667085] shadow-sm"
            onClick={() => setMode(mode === "reset" ? "login" : "reset")}
          >
            {mode === "reset" ? "Kembali log masuk" : "Lupa kata laluan"}
          </button>
        </div>
      </section>
    </main>
  );
}
