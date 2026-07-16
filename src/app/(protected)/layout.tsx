import { AppShell } from "@/components/layout/app-shell";
import { getDemoSnapshot } from "@/lib/finance/demo-data";

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell snapshot={getDemoSnapshot()}>{children}</AppShell>;
}
