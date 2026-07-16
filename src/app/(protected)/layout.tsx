import { AppShell } from "@/components/layout/app-shell";
import { getFinanceSnapshot } from "@/lib/finance/snapshot";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const snapshot = await getFinanceSnapshot();

  return <AppShell snapshot={snapshot}>{children}</AppShell>;
}
