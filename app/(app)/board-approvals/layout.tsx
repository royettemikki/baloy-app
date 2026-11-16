import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function BoardApprovalsLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('board', 'resident');
  return children;
}
