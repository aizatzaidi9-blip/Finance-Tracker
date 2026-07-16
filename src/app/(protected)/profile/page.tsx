import { ProfileView } from "@/components/profile/profile-view";
import { SetupRequired } from "@/components/setup/setup-required";
import { getFinanceSnapshot } from "@/lib/finance/snapshot";

export default async function ProfilePage() {
  const snapshot = await getFinanceSnapshot();

  if ("setupRequired" in snapshot) {
    return <SetupRequired message={snapshot.message} />;
  }

  return <ProfileView snapshot={snapshot} />;
}
