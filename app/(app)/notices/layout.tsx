import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function NoticesLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('announcements', 'resident');
  return children;
}
