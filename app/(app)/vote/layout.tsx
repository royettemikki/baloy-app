import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function VoteLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('elections', 'resident');
  return children;
}
