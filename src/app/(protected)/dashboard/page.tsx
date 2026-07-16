import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getFinanceSnapshot } from "@/lib/finance/snapshot";

export default async function DashboardPage() {
  const snapshot = await getFinanceSnapshot();

  return <DashboardView snapshot={snapshot} />;
}
