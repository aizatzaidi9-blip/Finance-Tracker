import { AppShell } from "@/components/layout/app-shell";
import { SetupRequired } from "@/components/setup/setup-required";
import { getFinanceSnapshot } from "@/lib/finance/snapshot";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const snapshot = await getFinanceSnapshot();

  if ("setupRequired" in snapshot) {
    return <SetupRequired message={snapshot.message} />;
  }

  return <AppShell snapshot={snapshot}>{children}</AppShell>;
}
