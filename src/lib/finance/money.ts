import type { Balances, FinanceTransaction } from "@/types/finance";

export const MYR_FORMATTER = new Intl.NumberFormat("ms-MY", {
  style: "currency",
  currency: "MYR",
  minimumFractionDigits: 2,
});

export function formatMYR(value: number) {
  return MYR_FORMATTER.format(roundMoney(value)).replace("MYR", "RM");
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function totalBalance(balances: Balances) {
  return roundMoney(balances.dailyBalance + balances.savingsBalance);
}

export function splitByPercentage(total: number, dailyPercentage: number) {
  const safePercentage = Math.min(100, Math.max(0, dailyPercentage));
  const dailyAmount = roundMoney(total * (safePercentage / 100));
  const savingsAmount = roundMoney(total - dailyAmount);
  return { dailyAmount, savingsAmount };
}

export function isValidSplit(total: number, dailyAmount: number, savingsAmount: number) {
  return (
    dailyAmount >= 0 &&
    savingsAmount >= 0 &&
    roundMoney(dailyAmount + savingsAmount) === roundMoney(total)
  );
}

export function applyTransaction(balances: Balances, transaction: FinanceTransaction): Balances {
  const next = { ...balances };
  if (transaction.type === "income") {
    next.dailyBalance = roundMoney(next.dailyBalance + transaction.dailyAmount);
    next.savingsBalance = roundMoney(next.savingsBalance + transaction.savingsAmount);
    return next;
  }
  if (transaction.destination === "daily") {
    if (transaction.totalAmount > next.dailyBalance) throw new Error("Baki Harian tidak mencukupi.");
    next.dailyBalance = roundMoney(next.dailyBalance - transaction.totalAmount);
    return next;
  }
  if (transaction.totalAmount > next.savingsBalance) throw new Error("Baki Simpanan tidak mencukupi.");
  next.savingsBalance = roundMoney(next.savingsBalance - transaction.totalAmount);
  return next;
}

export function reverseTransaction(balances: Balances, transaction: FinanceTransaction): Balances {
  const next = { ...balances };
  if (transaction.type === "income") {
    next.dailyBalance = roundMoney(next.dailyBalance - transaction.dailyAmount);
    next.savingsBalance = roundMoney(next.savingsBalance - transaction.savingsAmount);
    if (next.dailyBalance < 0 || next.savingsBalance < 0) throw new Error("Baki tidak boleh negatif.");
    return next;
  }
  if (transaction.destination === "daily") {
    next.dailyBalance = roundMoney(next.dailyBalance + transaction.totalAmount);
    return next;
  }
  next.savingsBalance = roundMoney(next.savingsBalance + transaction.totalAmount);
  return next;
}

export function editTransaction(
  balances: Balances,
  previous: FinanceTransaction,
  nextTransaction: FinanceTransaction,
) {
  return applyTransaction(reverseTransaction(balances, previous), nextTransaction);
}
