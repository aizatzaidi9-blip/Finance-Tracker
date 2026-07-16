import { redirect } from "next/navigation";

import { getDemoSnapshot } from "@/lib/finance/demo-data";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Category, FinanceSnapshot, FinanceTransaction } from "@/types/finance";

type ProfileRow = {
  display_name: string | null;
  avatar_url: string | null;
  currency: string | null;
  timezone: string | null;
};

type BalanceRow = {
  daily_balance: number | string | null;
  savings_balance: number | string | null;
};

type CategoryRow = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  colour: string;
  is_default: boolean | null;
  is_favourite: boolean | null;
  is_archived: boolean | null;
};

type TransactionRow = {
  id: string;
  type: "income" | "expense";
  destination: "daily" | "savings" | "split";
  total_amount: number | string;
  daily_amount: number | string | null;
  savings_amount: number | string | null;
  category_id: string;
  note: string | null;
  transaction_date: string;
  transaction_time: string;
  created_at: string;
};

export async function getFinanceSnapshot(): Promise<FinanceSnapshot> {
  const supabase = await createServerSupabase();

  if (!supabase) {
    return getDemoSnapshot();
  }
  const client = supabase;

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  await ensureUserRows(user.id, user.email ?? "Pengguna");

  const [profileResult, balanceResult, categoriesResult, transactionsResult] =
    await Promise.all([
      client
        .from("profiles")
        .select("display_name, avatar_url, currency, timezone")
        .eq("id", user.id)
        .single<ProfileRow>(),
      client
        .from("balances")
        .select("daily_balance, savings_balance")
        .eq("user_id", user.id)
        .single<BalanceRow>(),
      client
        .from("categories")
        .select(
          "id, name, type, icon, colour, is_default, is_favourite, is_archived",
        )
        .or(`user_id.is.null,user_id.eq.${user.id}`)
        .order("is_favourite", { ascending: false })
        .order("created_at", { ascending: true })
        .returns<CategoryRow[]>(),
      client
        .from("transactions")
        .select(
          "id, type, destination, total_amount, daily_amount, savings_amount, category_id, note, transaction_date, transaction_time, created_at",
        )
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false })
        .order("transaction_time", { ascending: false })
        .limit(200)
        .returns<TransactionRow[]>(),
    ]);

  if (profileResult.error) throw new Error(profileResult.error.message);
  if (balanceResult.error) throw new Error(balanceResult.error.message);
  if (categoriesResult.error) throw new Error(categoriesResult.error.message);
  if (transactionsResult.error) throw new Error(transactionsResult.error.message);

  return {
    profile: {
      displayName:
        profileResult.data.display_name || user.email?.split("@")[0] || "Pengguna",
      avatarUrl: profileResult.data.avatar_url ?? undefined,
      currency: "MYR",
      timezone: "Asia/Kuala_Lumpur",
    },
    balances: {
      dailyBalance: toNumber(balanceResult.data.daily_balance),
      savingsBalance: toNumber(balanceResult.data.savings_balance),
    },
    categories: categoriesResult.data.map(mapCategory),
    transactions: transactionsResult.data.map(mapTransaction),
  };

  async function ensureUserRows(userId: string, email: string) {
    await client.from("profiles").upsert(
      {
        id: userId,
        display_name: email.split("@")[0],
        currency: "MYR",
        timezone: "Asia/Kuala_Lumpur",
      },
      { onConflict: "id", ignoreDuplicates: true },
    );

    await client
      .from("balances")
      .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
  }
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    colour: row.colour,
    isDefault: row.is_default ?? false,
    isFavourite: row.is_favourite ?? false,
    isArchived: row.is_archived ?? false,
  };
}

function mapTransaction(row: TransactionRow): FinanceTransaction {
  return {
    id: row.id,
    type: row.type,
    destination: row.destination,
    totalAmount: toNumber(row.total_amount),
    dailyAmount: toNumber(row.daily_amount),
    savingsAmount: toNumber(row.savings_amount),
    categoryId: row.category_id,
    note: row.note ?? undefined,
    transactionDate: row.transaction_date,
    transactionTime: row.transaction_time.slice(0, 5),
    createdAt: row.created_at,
  };
}

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}
