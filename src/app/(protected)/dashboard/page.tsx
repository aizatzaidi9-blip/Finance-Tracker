import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getDemoSnapshot } from "@/lib/finance/demo-data";

export default function DashboardPage() {
  return <DashboardView snapshot={getDemoSnapshot()} />;
}
