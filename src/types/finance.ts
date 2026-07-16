export type MoneyBucket = "daily" | "savings";
export type TransactionType = "income" | "expense";
export type IncomeDestination = MoneyBucket | "split";
export type CategoryType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  colour: string;
  isDefault?: boolean;
  isFavourite?: boolean;
  isArchived?: boolean;
};

export type FinanceTransaction = {
  id: string;
  type: TransactionType;
  destination: IncomeDestination;
  totalAmount: number;
  dailyAmount: number;
  savingsAmount: number;
  categoryId: string;
  note?: string;
  transactionDate: string;
  transactionTime: string;
  createdAt: string;
};

export type Balances = {
  dailyBalance: number;
  savingsBalance: number;
};

export type FinanceSnapshot = {
  profile: {
    displayName: string;
    avatarUrl?: string;
    currency: "MYR";
    timezone: "Asia/Kuala_Lumpur";
  };
  balances: Balances;
  categories: Category[];
  transactions: FinanceTransaction[];
};
