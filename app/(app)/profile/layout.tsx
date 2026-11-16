import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('profile', 'resident');
  return children;
}
