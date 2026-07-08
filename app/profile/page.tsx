import { AppShell } from "@/components/layout/AppShell";
import { ProfileSummary } from "@/features/progress/ProfileSummary";

export default function ProfilePage() {
  return (
    <AppShell title="我的" subtitle="本地保存学习进度、收藏和答题记录。">
      <ProfileSummary />
    </AppShell>
  );
}
