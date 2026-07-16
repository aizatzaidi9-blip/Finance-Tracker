import { ProfileView } from "@/components/profile/profile-view";
import { getDemoSnapshot } from "@/lib/finance/demo-data";

export default function ProfilePage() {
  return <ProfileView snapshot={getDemoSnapshot()} />;
}
