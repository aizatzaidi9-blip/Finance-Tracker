import { ReportsView } from "@/components/reports/reports-view";
import { getFinanceSnapshot } from "@/lib/finance/snapshot";

export default async function ReportsPage() {
  const snapshot = await getFinanceSnapshot();

  return <ReportsView snapshot={snapshot} />;
}
