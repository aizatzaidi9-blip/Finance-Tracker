import { describe, expect, it } from "vitest";
import { applyTransaction, editTransaction, reverseTransaction, splitByPercentage, totalBalance } from "./money";
import type { FinanceTransaction } from "@/types/finance";

const base = { dailyBalance: 1000, savingsBalance: 500 };

function tx(overrides: Partial<FinanceTransaction>): FinanceTransaction {
  return {
    id: "t",
    type: "income",
    destination: "daily",
    totalAmount: 100,
    dailyAmount: 100,
    savingsAmount: 0,
    categoryId: "c",
    transactionDate: "2026-07-16",
    transactionTime: "09:00",
    createdAt: "2026-07-16T09:00:00+08:00",
    ...overrides,
  };
}

describe("finance money rules", () => {
  it("adds income to Harian", () => {
    expect(applyTransaction(base, tx({ destination: "daily", totalAmount: 200, dailyAmount: 200 }))).toEqual({ dailyBalance: 1200, savingsBalance: 500 });
  });

  it("adds income to Simpanan", () => {
    expect(applyTransaction(base, tx({ destination: "savings", totalAmount: 200, dailyAmount: 0, savingsAmount: 200 }))).toEqual({ dailyBalance: 1000, savingsBalance: 700 });
  });

  it("stores split income without double-counting total", () => {
    const result = applyTransaction(base, tx({ destination: "split", totalAmount: 3500, dailyAmount: 2450, savingsAmount: 1050 }));
    expect(result).toEqual({ dailyBalance: 3450, savingsBalance: 1550 });
    expect(totalBalance(result)).toBe(5000);
  });

  it("deducts expense from Harian", () => {
    expect(applyTransaction(base, tx({ type: "expense", destination: "daily", totalAmount: 80, dailyAmount: 80 }))).toEqual({ dailyBalance: 920, savingsBalance: 500 });
  });

  it("deducts expense from Simpanan", () => {
    expect(applyTransaction(base, tx({ type: "expense", destination: "savings", totalAmount: 80, dailyAmount: 0, savingsAmount: 80 }))).toEqual({ dailyBalance: 1000, savingsBalance: 420 });
  });

  it("prevents negative balance", () => {
    expect(() => applyTransaction(base, tx({ type: "expense", destination: "savings", totalAmount: 800 }))).toThrow("Baki Simpanan");
  });

  it("edits by reversing previous impact first", () => {
    const current = { dailyBalance: 1200, savingsBalance: 500 };
    const previous = tx({ destination: "daily", totalAmount: 200, dailyAmount: 200 });
    const next = tx({ destination: "savings", totalAmount: 300, dailyAmount: 0, savingsAmount: 300 });
    expect(editTransaction(current, previous, next)).toEqual({ dailyBalance: 1000, savingsBalance: 800 });
  });

  it("deletes by reversing a transaction", () => {
    expect(reverseTransaction({ dailyBalance: 1200, savingsBalance: 500 }, tx({ destination: "daily", totalAmount: 200, dailyAmount: 200 }))).toEqual({ dailyBalance: 1000, savingsBalance: 500 });
  });

  it("rounds split allocations to two decimals", () => {
    expect(splitByPercentage(100, 33.333)).toEqual({ dailyAmount: 33.33, savingsAmount: 66.67 });
  });

  it("calculates total balance", () => {
    expect(totalBalance({ dailyBalance: 123.45, savingsBalance: 876.55 })).toBe(1000);
  });
});
