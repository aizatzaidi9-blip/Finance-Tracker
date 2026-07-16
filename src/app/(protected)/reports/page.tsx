import { ReportsView } from "@/components/reports/reports-view";
import { getDemoSnapshot } from "@/lib/finance/demo-data";

export default function ReportsPage() {
  return <ReportsView snapshot={getDemoSnapshot()} />;
}
