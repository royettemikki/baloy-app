import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function FileCandidacyLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('elections', 'resident');
  return children;
}
