import { TransactionsView } from "@/components/transactions/transactions-view";
import { getDemoSnapshot } from "@/lib/finance/demo-data";

export default function TransactionsPage() {
  return <TransactionsView snapshot={getDemoSnapshot()} />;
}
