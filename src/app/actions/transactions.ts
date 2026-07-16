"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";
import { transactionSchema, type TransactionFormValues } from "@/lib/validation/transaction";

export async function saveTransactionAction(values: TransactionFormValues) {
  const parsed = transactionSchema.parse(values);
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: true, demo: true };
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser();
  if (userError || !userResult.user) throw new Error("Sila log masuk semula.");

  const { error } = await supabase.rpc("create_finance_transaction", {
    p_type: parsed.type,
    p_destination: parsed.destination,
    p_total_amount: parsed.totalAmount,
    p_daily_amount: parsed.dailyAmount,
    p_savings_amount: parsed.savingsAmount,
    p_category_id: parsed.categoryId,
    p_note: parsed.note ?? null,
    p_transaction_date: parsed.transactionDate,
    p_transaction_time: parsed.transactionTime,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/reports");
  return { ok: true };
}
