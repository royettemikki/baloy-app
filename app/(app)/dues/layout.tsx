import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function DuesLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('payments', 'resident');
  return children;
}
