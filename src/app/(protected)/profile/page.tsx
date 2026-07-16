import { ProfileView } from "@/components/profile/profile-view";
import { getFinanceSnapshot } from "@/lib/finance/snapshot";

export default async function ProfilePage() {
  const snapshot = await getFinanceSnapshot();

  return <ProfileView snapshot={snapshot} />;
}
