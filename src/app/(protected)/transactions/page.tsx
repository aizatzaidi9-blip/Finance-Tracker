import { TransactionsView } from "@/components/transactions/transactions-view";
import { SetupRequired } from "@/components/setup/setup-required";
import { getFinanceSnapshot } from "@/lib/finance/snapshot";

export default async function TransactionsPage() {
  const snapshot = await getFinanceSnapshot();

  if ("setupRequired" in snapshot) {
    return <SetupRequired message={snapshot.message} />;
  }

  return <TransactionsView snapshot={snapshot} />;
}
