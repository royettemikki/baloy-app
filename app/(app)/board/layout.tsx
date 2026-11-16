import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function BoardLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('board', 'resident');
  return children;
}
