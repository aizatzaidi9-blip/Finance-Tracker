import { TransactionsView } from "@/components/transactions/transactions-view";
import { getFinanceSnapshot } from "@/lib/finance/snapshot";

export default async function TransactionsPage() {
  const snapshot = await getFinanceSnapshot();

  return <TransactionsView snapshot={snapshot} />;
}
