import { z } from "zod";
import { isValidSplit } from "@/lib/finance/money";

const money = z
  .number()
  .positive("Jumlah mesti lebih daripada sifar.")
  .refine((value) => Number.isInteger(Math.round(value * 100)), "Maksimum dua titik perpuluhan.");

export const transactionSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    destination: z.enum(["daily", "savings", "split"]),
    totalAmount: money,
    dailyAmount: z.number().min(0),
    savingsAmount: z.number().min(0),
    categoryId: z.string().min(1),
    note: z.string().max(200).optional(),
    transactionDate: z.string().min(1),
    transactionTime: z.string().min(1),
  })
  .superRefine((value, context) => {
    if (value.type === "expense" && value.destination === "split") {
      context.addIssue({ code: "custom", path: ["destination"], message: "Duit Keluar hanya daripada Harian atau Simpanan." });
    }
    if (value.type === "income" && value.destination === "split" && !isValidSplit(value.totalAmount, value.dailyAmount, value.savingsAmount)) {
      context.addIssue({ code: "custom", path: ["dailyAmount"], message: "Jumlah Bahagikan mesti sama dengan jumlah keseluruhan." });
    }
  });

export type TransactionFormValues = z.infer<typeof transactionSchema>;
