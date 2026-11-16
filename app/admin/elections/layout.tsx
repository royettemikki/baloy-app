import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function ElectionsLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('elections', 'admin');
  return children;
}
