import { DashboardView } from "@/components/dashboard/dashboard-view";
import { SetupRequired } from "@/components/setup/setup-required";
import { getFinanceSnapshot } from "@/lib/finance/snapshot";

export default async function DashboardPage() {
  const snapshot = await getFinanceSnapshot();

  if ("setupRequired" in snapshot) {
    return <SetupRequired message={snapshot.message} />;
  }

  return <DashboardView snapshot={snapshot} />;
}
