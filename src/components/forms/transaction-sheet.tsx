"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Check, ChevronRight, Coins, Divide, Pencil, Plus, Repeat2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { saveTransactionAction } from "@/app/actions/transactions";
import { CategoryIcon } from "@/components/finance/category-icon";
import { Button } from "@/components/ui/button";
import { formatMYR, roundMoney, splitByPercentage } from "@/lib/finance/money";
import type { FinanceSnapshot, IncomeDestination, TransactionType } from "@/types/finance";

type Step = "type" | "destination" | "amount" | "split" | "category" | "details" | "review" | "success";

export function TransactionSheet({
  snapshot,
  floating,
  triggerLabel,
}: {
  snapshot: FinanceSnapshot;
  floating?: boolean;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {floating ? (
        <button
          aria-label="Tambah transaksi"
          onClick={() => setOpen(true)}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#6C4CF5] to-[#4361EE] text-white shadow-xl shadow-indigo-500/35 transition active:scale-95"
        >
          <Plus size={30} />
        </button>
      ) : (
        <Button className="mt-8 w-full" onClick={() => setOpen(true)}>
          <Plus size={18} />
          {triggerLabel}
        </Button>
      )}
      <AnimatePresence>
        {open ? <SheetContent snapshot={snapshot} close={() => setOpen(false)} /> : null}
      </AnimatePresence>
    </>
  );
}

function SheetContent({ snapshot, close }: { snapshot: FinanceSnapshot; close: () => void }) {
  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<TransactionType | null>(null);
  const [destination, setDestination] = useState<IncomeDestination | null>(null);
  const [amount, setAmount] = useState(0);
  const [dailyAmount, setDailyAmount] = useState(0);
  const [savingsAmount, setSavingsAmount] = useState(0);
  const [splitMode, setSplitMode] = useState<"slider" | "manual">("slider");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const categories = snapshot.categories.filter((category) => category.type === type && !category.isArchived);
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const selectedBalance =
    destination === "savings" ? snapshot.balances.savingsBalance : snapshot.balances.dailyBalance;
  const balanceAfter =
    type === "expense" && destination !== "split" ? roundMoney(selectedBalance - amount) : selectedBalance;
  const canContinueAmount = amount > 0 && (type !== "expense" || amount <= selectedBalance);
  const canContinueSplit = amount > 0 && dailyAmount >= 0 && savingsAmount >= 0 && roundMoney(dailyAmount + savingsAmount) === roundMoney(amount);

  function chooseType(nextType: TransactionType) {
    setType(nextType);
    setDestination(null);
    setStep("destination");
  }

  function chooseDestination(nextDestination: IncomeDestination) {
    setDestination(nextDestination);
    setAmount(0);
    if (nextDestination === "split") {
      setDailyAmount(0);
      setSavingsAmount(0);
    }
    setStep("amount");
  }

  function setAmountAndAllocations(next: number) {
    const safe = Math.max(0, roundMoney(next));
    setAmount(safe);
    if (destination === "split") {
      const split = splitByPercentage(safe, 70);
      setDailyAmount(split.dailyAmount);
      setSavingsAmount(split.savingsAmount);
    } else if (type === "income") {
      setDailyAmount(destination === "daily" ? safe : 0);
      setSavingsAmount(destination === "savings" ? safe : 0);
    } else {
      setDailyAmount(destination === "daily" ? safe : 0);
      setSavingsAmount(destination === "savings" ? safe : 0);
    }
  }

  function save() {
    if (!type || !destination || !selectedCategory) return;
    startTransition(async () => {
      try {
        await saveTransactionAction({
          type,
          destination,
          totalAmount: amount,
          dailyAmount,
          savingsAmount,
          categoryId: selectedCategory.id,
          note,
          transactionDate: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" }),
          transactionTime: new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kuala_Lumpur", hour: "2-digit", minute: "2-digit" }),
        });
        toast.success(type === "income" ? "Pendapatan telah direkodkan." : "Perbelanjaan telah direkodkan.");
        setStep("success");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Transaksi tidak berjaya disimpan.");
      }
    });
  }

  return (
    <motion.div className="fixed inset-0 z-50 bg-slate-950/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="absolute inset-x-0 bottom-0 mx-auto max-h-[92dvh] max-w-md overflow-hidden rounded-t-[34px] bg-[#F7F8FC] shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" onClick={step === "type" ? close : () => setStep(previousStep(step, type, destination))} aria-label="Kembali">
            {step === "type" ? <X size={20} /> : <ArrowLeft size={20} />}
          </button>
          <p className="font900">{type === "expense" ? "Duit Keluar" : type === "income" ? "Duit Masuk" : "Tambah Transaksi"}</p>
          <div className="h-11 w-11" />
        </div>
        <div className="max-h-[calc(92dvh-68px)] overflow-y-auto px-5 pb-[max(24px,env(safe-area-inset-bottom))]">
          <Progress step={step} type={type} />
          {step === "type" ? (
            <div className="space-y-4 pt-8">
              <h2 className="text-center text-lg font900">Apa yang anda nak rekod?</h2>
              <ChoiceCard title="Duit Masuk" description="Tambah pendapatan atau penerimaan wang" colour="#12B76A" icon={<ArrowDown />} onClick={() => chooseType("income")} />
              <ChoiceCard title="Duit Keluar" description="Catat perbelanjaan anda" colour="#FF4567" icon={<ArrowUp />} onClick={() => chooseType("expense")} />
              <div className="rounded-[28px] bg-white p-5 text-center text-sm font700 text-[#667085] shadow-sm">
                Rekod hanya dua jenis transaksi: Duit Masuk atau Duit Keluar.
              </div>
            </div>
          ) : null}

          {step === "destination" && type === "income" ? (
            <div className="space-y-4 pt-6">
              <h2 className="text-center text-lg font900">Duit ini nak masuk ke mana?</h2>
              <DestinationCard title="Harian sahaja" description="Masuk ke baki harian anda" active={destination === "daily"} onClick={() => chooseDestination("daily")} />
              <DestinationCard title="Simpanan sahaja" description="Terus masuk ke simpanan anda" active={destination === "savings"} onClick={() => chooseDestination("savings")} tone="green" />
              <DestinationCard title="Bahagikan" description="Bahagikan antara Harian dan Simpanan" active={destination === "split"} onClick={() => chooseDestination("split")} tone="orange" />
            </div>
          ) : null}

          {step === "destination" && type === "expense" ? (
            <div className="space-y-4 pt-6">
              <h2 className="text-center text-lg font900">Duit ini keluar daripada?</h2>
              <DestinationCard title="Harian" description="Gunakan baki Harian" active={destination === "daily"} onClick={() => chooseDestination("daily")} />
              <DestinationCard title="Simpanan" description="Gunakan baki Simpanan" active={destination === "savings"} onClick={() => chooseDestination("savings")} tone="green" />
              <div className="rounded-[24px] bg-rose-50 p-4 text-sm font800 text-[#FF4567]">Pilih sumber dengan betul untuk rekod yang lebih tepat.</div>
            </div>
          ) : null}

          {step === "amount" ? (
            <div className="space-y-5 pt-5">
              <div className="text-center">
                <h2 className="text-lg font900">{type === "income" ? "Masukkan jumlah" : "Masukkan jumlah"}</h2>
                <p className="text-sm text-[#667085]">{type === "income" ? "Jumlah pendapatan anda" : "Jumlah perbelanjaan anda"}</p>
              </div>
              <AmountInput amount={amount} setAmount={setAmountAndAllocations} quick={type === "income" ? [10, 50, 100, 500] : [5, 10, 20, 50, 100]} />
              {type === "expense" ? (
                <div className={balanceAfter < 0 ? "rounded-[24px] bg-rose-50 p-4 text-[#FF4567]" : "rounded-[24px] bg-white p-4 text-[#6C4CF5] shadow-sm"}>
                  <p className="text-xs font800 text-[#667085]">Baki {destination === "daily" ? "Harian" : "Simpanan"} Selepas</p>
                  <p className="mt-1 text-xl font900">{formatMYR(balanceAfter)}</p>
                </div>
              ) : null}
              <Button className="sticky bottom-3 w-full" size="lg" disabled={!canContinueAmount} onClick={() => destination === "split" ? setStep("split") : setStep("category")}>
                Seterusnya
              </Button>
            </div>
          ) : null}

          {step === "split" ? (
            <div className="space-y-5 pt-5">
              <div className="text-center">
                <h2 className="text-lg font900">Bahagikan jumlah anda</h2>
                <p className="mt-1 text-4xl font900 text-[#6C4CF5]">{formatMYR(amount)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AllocationCard label="Harian" amount={dailyAmount} total={amount} colour="#6C4CF5" />
                <AllocationCard label="Simpanan" amount={savingsAmount} total={amount} colour="#12B76A" />
              </div>
              <div className="flex rounded-2xl bg-white p-1 shadow-sm">
                {(["slider", "manual"] as const).map((mode) => (
                  <button key={mode} onClick={() => setSplitMode(mode)} className={splitMode === mode ? "min-h-11 flex-1 rounded-xl bg-[#6C4CF5] text-sm font900 text-white" : "min-h-11 flex-1 text-sm font900 text-[#667085]"}>
                    {mode === "slider" ? "Slider" : "Manual"}
                  </button>
                ))}
              </div>
              {splitMode === "slider" ? (
                <div className="rounded-[26px] bg-white p-4 shadow-sm">
                  <input
                    aria-label="Peratus Harian"
                    type="range"
                    min="0"
                    max="100"
                    value={amount ? Math.round((dailyAmount / amount) * 100) : 0}
                    onChange={(event) => {
                      const split = splitByPercentage(amount, Number(event.target.value));
                      setDailyAmount(split.dailyAmount);
                      setSavingsAmount(split.savingsAmount);
                    }}
                    className="w-full accent-[#6C4CF5]"
                  />
                  <div className="mt-2 flex justify-between text-xs font800 text-[#667085]"><span>0%</span><span>50%</span><span>100%</span></div>
                </div>
              ) : (
                <div className="grid grid-cols-[1fr_44px_1fr] items-center gap-2">
                  <ManualMoneyInput label="Harian" value={dailyAmount} onChange={(value) => { const safe = Math.min(amount, Math.max(0, value)); setDailyAmount(roundMoney(safe)); setSavingsAmount(roundMoney(amount - safe)); }} />
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#6C4CF5] shadow-sm"><Repeat2 size={18} /></div>
                  <ManualMoneyInput label="Simpanan" value={savingsAmount} onChange={(value) => { const safe = Math.min(amount, Math.max(0, value)); setSavingsAmount(roundMoney(safe)); setDailyAmount(roundMoney(amount - safe)); }} />
                </div>
              )}
              <div className="rounded-[24px] bg-white p-4 text-sm font800 leading-7 shadow-sm">
                Harian: {formatMYR(dailyAmount)} ({amount ? Math.round((dailyAmount / amount) * 100) : 0}%)<br />
                Simpanan: {formatMYR(savingsAmount)} ({amount ? Math.round((savingsAmount / amount) * 100) : 0}%)
              </div>
              <Button className="sticky bottom-3 w-full" size="lg" disabled={!canContinueSplit} onClick={() => setStep("category")}>Seterusnya</Button>
            </div>
          ) : null}

          {step === "category" ? (
            <div className="space-y-5 pt-5">
              <div className="text-center">
                <h2 className="text-lg font900">Pilih kategori {type === "income" ? "pendapatan" : "perbelanjaan"}</h2>
                <p className="text-sm text-[#667085]">Pilih kategori yang paling sesuai.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button key={category.id} onClick={() => setCategoryId(category.id)} className={categoryId === category.id ? "min-h-20 rounded-[22px] border-2 border-[#6C4CF5] bg-white p-3 text-left shadow-sm" : "min-h-20 rounded-[22px] border border-[#EAECF0] bg-white p-3 text-left shadow-sm"}>
                    <CategoryIcon icon={category.icon} colour={category.colour} size={34} />
                    <p className="mt-2 text-sm font900">{category.name}</p>
                  </button>
                ))}
              </div>
              <Button className="sticky bottom-3 w-full" size="lg" disabled={!categoryId} onClick={() => setStep("details")}>Seterusnya</Button>
              <button className="mx-auto flex min-h-11 items-center gap-2 text-sm font900 text-[#6C4CF5]"><Plus size={16} />Kategori baru</button>
            </div>
          ) : null}

          {step === "details" ? (
            <div className="space-y-5 pt-5">
              <h2 className="text-center text-lg font900">Butiran tambahan</h2>
              <textarea value={note} onChange={(event) => setNote(event.target.value.slice(0, 200))} placeholder="Catatan pilihan" className="min-h-28 w-full resize-none rounded-[24px] border border-[#EAECF0] bg-white p-4 font700 shadow-sm focus:outline-[#6C4CF5]" />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[22px] bg-white p-4 shadow-sm"><p className="text-xs font800 text-[#667085]">Tarikh</p><p className="font900">Hari ini</p></div>
                <div className="rounded-[22px] bg-white p-4 shadow-sm"><p className="text-xs font800 text-[#667085]">Masa</p><p className="font900">Sekarang</p></div>
              </div>
              <Button className="sticky bottom-3 w-full" size="lg" onClick={() => setStep("review")}>Semak</Button>
            </div>
          ) : null}

          {step === "review" ? (
            <div className="space-y-5 pt-5">
              <h2 className="text-center text-lg font900">Semak & Sahkan</h2>
              <div className="space-y-3 rounded-[28px] bg-white p-4 shadow-sm">
                <ReviewRow label={type === "income" ? "Jumlah Keseluruhan" : "Jumlah Perbelanjaan"} value={formatMYR(amount)} large />
                {type === "income" && <ReviewRow label="Harian" value={formatMYR(dailyAmount)} />}
                {type === "income" && <ReviewRow label="Simpanan" value={formatMYR(savingsAmount)} />}
                {type === "expense" && <ReviewRow label="Daripada" value={destination === "daily" ? "Harian" : "Simpanan"} />}
                <ReviewRow label="Kategori" value={selectedCategory?.name ?? "-"} />
                <ReviewRow label="Catatan" value={note || "-"} />
                {type === "expense" && <ReviewRow label="Baki selepas" value={formatMYR(balanceAfter)} />}
              </div>
              <Button className="w-full" size="lg" variant={type === "expense" ? "danger" : "success"} disabled={isPending} onClick={save}>
                {type === "expense" ? "Simpan Perbelanjaan" : "Simpan Transaksi"}
              </Button>
              <Button className="w-full" variant="ghost" onClick={() => setStep("details")}>Ubah Maklumat</Button>
            </div>
          ) : null}

          {step === "success" ? (
            <div className="space-y-5 py-8 text-center">
              <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-[#12B76A]">
                <Check size={48} strokeWidth={3} />
              </motion.div>
              <div>
                <h2 className="text-3xl font900">Berjaya!</h2>
                <p className="mt-2 text-sm font700 text-[#667085]">{type === "income" ? "Pendapatan telah direkodkan." : "Perbelanjaan telah direkodkan."}</p>
              </div>
              <div className="space-y-3 text-left">
                {type === "income" && dailyAmount > 0 ? <SuccessCard title="Harian" amount={`+${formatMYR(dailyAmount)}`} /> : null}
                {type === "income" && savingsAmount > 0 ? <SuccessCard title="Simpanan" amount={`+${formatMYR(savingsAmount)}`} /> : null}
                {type === "expense" ? <SuccessCard title={destination === "daily" ? "Harian" : "Simpanan"} amount={`-${formatMYR(amount)}`} /> : null}
              </div>
              <Button className="w-full" size="lg" onClick={close}>Lihat Dashboard</Button>
              <Button className="w-full" variant="secondary" onClick={() => setStep("type")}>Tambah Lagi</Button>
            </div>
          ) : null}
        </div>
      </motion.section>
    </motion.div>
  );
}

function previousStep(step: Step, type: TransactionType | null, destination: IncomeDestination | null): Step {
  if (step === "destination") return "type";
  if (step === "amount") return "destination";
  if (step === "split") return "amount";
  if (step === "category") return destination === "split" ? "split" : "amount";
  if (step === "details") return "category";
  if (step === "review") return "details";
  if (step === "success") return type ? "review" : "type";
  return "type";
}

function Progress({ step, type }: { step: Step; type: TransactionType | null }) {
  const labels = type === "expense" ? ["Darimana", "Jumlah", "Kategori", "Semak"] : ["Destinasi", "Jumlah", "Kategori", "Semak"];
  const index = Math.max(0, ["destination", "amount", "split", "category", "details", "review"].indexOf(step));
  if (step === "type" || step === "success") return null;
  const active = step === "split" ? 1 : step === "details" ? 2 : step === "review" ? 3 : Math.min(index, 3);
  return (
    <div className="grid grid-cols-4 gap-2 px-2 pt-2">
      {labels.map((label, itemIndex) => (
        <div key={label} className="text-center">
          <div className={itemIndex <= active ? "mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-[#6C4CF5] text-xs font900 text-white" : "mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-[#D0D5DD] text-xs font900 text-white"}>{itemIndex + 1}</div>
          <p className={itemIndex <= active ? "mt-1 text-[10px] font900 text-[#6C4CF5]" : "mt-1 text-[10px] font800 text-[#98A2B3]"}>{label}</p>
        </div>
      ))}
    </div>
  );
}

function ChoiceCard({ title, description, colour, icon, onClick }: { title: string; description: string; colour: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-28 w-full items-center gap-4 rounded-[28px] border border-[#EAECF0] bg-white p-4 text-left shadow-sm transition active:scale-[0.99]">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: colour }}>{icon}</span>
      <span className="min-w-0 flex-1"><span className="block font900">{title}</span><span className="mt-1 block text-sm font700 leading-6 text-[#667085]">{description}</span></span>
      <ChevronRight size={20} />
    </button>
  );
}

function DestinationCard({ title, description, active, onClick, tone = "purple" }: { title: string; description: string; active: boolean; onClick: () => void; tone?: "purple" | "green" | "orange" }) {
  const colour = tone === "green" ? "#12B76A" : tone === "orange" ? "#FF9F1C" : "#6C4CF5";
  return (
    <button onClick={onClick} className={active ? "flex w-full items-center gap-4 rounded-[26px] border-2 border-[#6C4CF5] bg-white p-4 text-left shadow-sm" : "flex w-full items-center gap-4 rounded-[26px] border border-[#EAECF0] bg-white p-4 text-left shadow-sm"}>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: colour }}>{tone === "orange" ? <Divide /> : <Coins />}</span>
      <span className="flex-1"><span className="block font900">{title}</span><span className="text-sm font700 leading-6 text-[#667085]">{description}</span></span>
      <span className={active ? "h-6 w-6 rounded-full border-[7px] border-[#6C4CF5]" : "h-6 w-6 rounded-full border-2 border-[#D0D5DD]"} />
    </button>
  );
}

function AmountInput({ amount, setAmount, quick }: { amount: number; setAmount: (value: number) => void; quick: number[] }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];
  const display = amount ? amount.toFixed(2).replace(/\.00$/, ".00") : "0.00";
  const [raw, setRaw] = useState("");
  function push(key: string) {
    const next = key === "back" ? raw.slice(0, -1) : `${raw}${key}`;
    if (!/^\d{0,8}(\.\d{0,2})?$/.test(next)) return;
    setRaw(next);
    setAmount(Number(next || 0));
  }
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <span className="pb-2 text-lg font900 text-[#6C4CF5]">RM</span>
        <p className="text-5xl font900 tracking-normal text-[#6C4CF5]">{display}</p>
        <button className="mb-2 ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" aria-label="Edit jumlah"><Pencil size={18} /></button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {quick.map((value) => <button key={value} onClick={() => setAmount(amount + value)} className="min-h-11 rounded-2xl bg-white text-sm font900 shadow-sm">+{value}</button>)}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((key) => <button key={key} onClick={() => push(key)} className="min-h-12 rounded-xl bg-white text-xl font900 shadow-sm">{key === "back" ? "⌫" : key}</button>)}
      </div>
    </div>
  );
}

function AllocationCard({ label, amount, total, colour }: { label: string; amount: number; total: number; colour: string }) {
  return (
    <div className="rounded-[24px] border border-[#EAECF0] bg-white p-4 shadow-sm">
      <p className="text-sm font900" style={{ color: colour }}>{label}</p>
      <p className="mt-3 font900">{formatMYR(amount)}</p>
      <p className="mt-1 text-sm font900" style={{ color: colour }}>{total ? Math.round((amount / total) * 100) : 0}%</p>
    </div>
  );
}

function ManualMoneyInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="rounded-[22px] bg-white p-3 shadow-sm">
      <span className="text-xs font800 text-[#667085]">{label}</span>
      <input className="mt-1 w-full bg-transparent text-lg font900 focus:outline-none" type="number" min={0} step="0.01" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function ReviewRow({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return <div className="flex items-center justify-between gap-4 border-b border-[#EAECF0] pb-3 last:border-0 last:pb-0"><span className="text-sm font800 text-[#667085]">{label}</span><span className={large ? "text-xl font900" : "text-sm font900"}>{value}</span></div>;
}

function SuccessCard({ title, amount }: { title: string; amount: string }) {
  return <div className="rounded-[24px] bg-white p-4 shadow-sm"><p className="text-sm font900 text-[#6C4CF5]">{title}</p><p className="mt-1 text-xl font900 text-[#12B76A]">{amount}</p><p className="mt-1 text-xs font700 text-[#667085]">Baki dikemas kini selepas simpan.</p></div>;
}
