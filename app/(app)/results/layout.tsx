import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function ResultsLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('elections', 'resident');
  return children;
}
