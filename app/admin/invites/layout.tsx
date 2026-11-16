import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function ResidentsLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('residents', 'admin');
  return children;
}
