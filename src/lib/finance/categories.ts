import type { Category } from "@/types/finance";

export const incomeCategories: Category[] = [
  { id: "income-salary", name: "Gaji", type: "income", icon: "wallet", colour: "#6C4CF5", isDefault: true, isFavourite: true },
  { id: "income-bonus", name: "Bonus / Komisen", type: "income", icon: "trophy", colour: "#FF9F1C", isDefault: true },
  { id: "income-freelance", name: "Freelance", type: "income", icon: "briefcase", colour: "#4361EE", isDefault: true },
  { id: "income-dividend", name: "Dividen", type: "income", icon: "sprout", colour: "#12B76A", isDefault: true },
  { id: "income-refund", name: "Refund / Cashback", type: "income", icon: "refresh", colour: "#00BFA6", isDefault: true },
  { id: "income-gift", name: "Hadiah", type: "income", icon: "gift", colour: "#FF4567", isDefault: true },
  { id: "income-interest", name: "Faedah", type: "income", icon: "percent", colour: "#14B8A6", isDefault: true },
  { id: "income-investment", name: "Pelaburan", type: "income", icon: "chart", colour: "#4361EE", isDefault: true },
  { id: "income-other", name: "Lain-lain Pendapatan", type: "income", icon: "more", colour: "#667085", isDefault: true },
];

export const expenseCategories: Category[] = [
  { id: "expense-food", name: "Makanan & Minuman", type: "expense", icon: "utensils", colour: "#FF9F1C", isDefault: true, isFavourite: true },
  { id: "expense-transport", name: "Pengangkutan", type: "expense", icon: "car", colour: "#4361EE", isDefault: true },
  { id: "expense-bills", name: "Bil & Utiliti", type: "expense", icon: "receipt", colour: "#12B76A", isDefault: true },
  { id: "expense-rent", name: "Rumah / Sewa", type: "expense", icon: "home", colour: "#6C4CF5", isDefault: true },
  { id: "expense-shopping", name: "Beli-belah", type: "expense", icon: "shopping", colour: "#8B5CF6", isDefault: true },
  { id: "expense-entertainment", name: "Hiburan", type: "expense", icon: "music", colour: "#FF4567", isDefault: true },
  { id: "expense-health", name: "Kesihatan", type: "expense", icon: "heart", colour: "#F43F5E", isDefault: true },
  { id: "expense-education", name: "Pendidikan", type: "expense", icon: "graduation", colour: "#2563EB", isDefault: true },
  { id: "expense-clothes", name: "Pakaian", type: "expense", icon: "shirt", colour: "#EC4899", isDefault: true },
  { id: "expense-family", name: "Keluarga", type: "expense", icon: "users", colour: "#00BFA6", isDefault: true },
  { id: "expense-subscription", name: "Langganan", type: "expense", icon: "repeat", colour: "#64748B", isDefault: true },
  { id: "expense-donation", name: "Derma", type: "expense", icon: "hand", colour: "#12B76A", isDefault: true },
  { id: "expense-other", name: "Lain-lain", type: "expense", icon: "more", colour: "#667085", isDefault: true },
];

export const defaultCategories = [...incomeCategories, ...expenseCategories];
