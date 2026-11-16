import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function AnnouncementsLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('announcements', 'admin');
  return children;
}
