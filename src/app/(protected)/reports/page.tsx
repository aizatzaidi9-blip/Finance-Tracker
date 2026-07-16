import { ReportsView } from "@/components/reports/reports-view";
import { SetupRequired } from "@/components/setup/setup-required";
import { getFinanceSnapshot } from "@/lib/finance/snapshot";

export default async function ReportsPage() {
  const snapshot = await getFinanceSnapshot();

  if ("setupRequired" in snapshot) {
    return <SetupRequired message={snapshot.message} />;
  }

  return <ReportsView snapshot={snapshot} />;
}
